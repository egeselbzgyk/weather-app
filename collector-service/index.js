const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const PocketBase = require('pocketbase/cjs');
require('dotenv').config({ path: '.env-local' });

const app = express();
const port = process.env.PORT || 3001;
const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// PocketBase client
const pb = new PocketBase(pocketbaseUrl);

// Store running collectors
const runningCollectors = new Map();

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(location, attribute) {
  try {
    // Check for valid API key
    if (!openWeatherApiKey) {
      throw new Error('Invalid or missing OpenWeather API key. Please provide a valid API key in the environment variables.');
    }
    
    // Try to find location in the locations collection to get country code
    let query = location;
    try {
      const locationRecord = await pb.collection('locations').getFirstListItem(`name="${location}"`);
      if (locationRecord && locationRecord.country) {
        query = `${location},${locationRecord.country}`;
      }
    } catch (err) {
      // If location not found in DB, use location name only
      console.log(`Location ${location} not found in database, using name only`);
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: query,
        appid: openWeatherApiKey,
        units: 'metric'
      }
    });
    
    let value;
    
    // Log the API response for debugging
    console.log(`API Response for ${query}:`, {
      name: response.data.name,
      country: response.data.sys.country,
      temp: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      wind_speed: response.data.wind?.speed
    });
    
    // Extract the requested attribute from the response
    switch (attribute.toLowerCase()) {
      case 'temperature':
        value = Math.round(response.data.main.temp * 10) / 10; // Round to 1 decimal place
        break;
      case 'humidity':
        value = response.data.main.humidity;
        break;
      case 'pressure':
        value = response.data.main.pressure;
        break;
      case 'wind_speed':
        value = response.data.wind?.speed || 0; // Handle missing wind data
        break;
      default:
        throw new Error(`Unsupported attribute: ${attribute}`);
    }
    
    return {
      location,
      attribute,
      value,
      timestamp: new Date(),
      source: 'OpenWeatherMap'
    };
  } catch (error) {
    console.error(`Error fetching weather data for ${location}:`, error);
    throw error;
  }
}

// Function to save weather data to PocketBase
async function saveWeatherData(data) {
  try {
    await pb.collection('weather_data').create({
      location: data.location,
      attribute: data.attribute,
      value: data.value,
      timestamp: data.timestamp,
      source: data.source
    });
    
    console.log(`Saved ${data.attribute} data for ${data.location}: ${data.value}`);
  } catch (error) {
    console.error('Error saving to PocketBase:', error);
  }
}

// Routes
app.post('/collect', (req, res) => {
  try {
    const { location, attribute, interval } = req.body;
    
    if (!location || !attribute || !interval) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const collectorId = uuidv4();
    
    // Set up interval for data collection
    const intervalId = setInterval(async () => {
      try {
        const weatherData = await fetchWeatherData(location, attribute);
        await saveWeatherData(weatherData);
      } catch (error) {
        console.error(`Collector ${collectorId} error:`, error);
      }
    }, interval * 1000); // Convert to milliseconds
    
    // Store collector info
    runningCollectors.set(collectorId, {
      id: collectorId,
      location,
      attribute,
      interval,
      intervalId,
      startTime: new Date()
    });
    
    // Trigger immediate first collection
    (async () => {
      try {
        const weatherData = await fetchWeatherData(location, attribute);
        await saveWeatherData(weatherData);
      } catch (error) {
        console.error(`Initial collection error for ${collectorId}:`, error);
      }
    })();
    
    res.status(201).json({ 
      id: collectorId,
      location,
      attribute,
      interval,
      startTime: new Date()
    });
  } catch (error) {
    console.error('Error starting collector:', error);
    res.status(500).json({ error: 'Failed to start collector' });
  }
});

app.delete('/collect/:id', (req, res) => {
  try {
    const collectorId = req.params.id;
    
    if (!runningCollectors.has(collectorId)) {
      return res.status(404).json({ error: 'Collector not found' });
    }
    
    // Clear the interval to stop data collection
    const collector = runningCollectors.get(collectorId);
    clearInterval(collector.intervalId);
    
    // Remove from running collectors
    runningCollectors.delete(collectorId);
    
    res.json({ 
      message: 'Collector stopped', 
      collector: {
        id: collector.id,
        location: collector.location,
        attribute: collector.attribute,
        interval: collector.interval,
        startTime: collector.startTime,
        stopTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error stopping collector:', error);
    res.status(500).json({ error: 'Failed to stop collector' });
  }
});

app.get('/collectors', (req, res) => {
  const collectors = Array.from(runningCollectors.values()).map(collector => ({
    id: collector.id,
    location: collector.location,
    attribute: collector.attribute,
    interval: collector.interval,
    startTime: collector.startTime
  }));
  
  res.json(collectors);
});

// Start the server
app.listen(port, () => {
  console.log(`Collector service running at http://localhost:${port}`);
  console.log(`OpenWeatherMap API key status: ${openWeatherApiKey ? 'Provided' : 'Not provided'}`);
  console.log(`Using API key: ${openWeatherApiKey ? openWeatherApiKey.substring(0, 5) + '...' : 'None'}`);
}); 