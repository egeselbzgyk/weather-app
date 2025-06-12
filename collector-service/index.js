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

// City Management Endpoints

// Get all cities/locations
app.get('/cities', async (req, res) => {
  try {
    const records = await pb.collection('locations').getFullList({
      sort: 'name'
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Add a new city
app.post('/cities', async (req, res) => {
  try {
    const { name, country } = req.body;
    
    if (!name || !country) {
      return res.status(400).json({ error: 'City name and country are required' });
    }
    
    // Normalize country input (trim and handle both codes and full names)
    const normalizedCountry = country.trim();
    
    // Check if city already exists (case insensitive)
    try {
      const existingCity = await pb.collection('locations').getFirstListItem(
        `name~"${name.trim()}" && country~"${normalizedCountry}"`
      );
      if (existingCity) {
        return res.status(409).json({ error: 'City already exists' });
      }
    } catch (err) {
      // City doesn't exist, continue with creation
    }
    
    // Verify city exists via OpenWeatherMap API
    if (openWeatherApiKey) {
      try {
        await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
          params: {
            q: `${name.trim()},${normalizedCountry}`,
            appid: openWeatherApiKey
          }
        });
      } catch (error) {
        return res.status(400).json({ 
          error: 'City not found in weather service. Please verify the city name and country.' 
        });
      }
    }
    
    const record = await pb.collection('locations').create({
      name: name.trim(),
      country: normalizedCountry
    });
    
    res.status(201).json(record);
  } catch (error) {
    console.error('Error adding city:', error);
    res.status(500).json({ error: 'Failed to add city' });
  }
});

// Update a city
app.put('/cities/:id', async (req, res) => {
  try {
    const cityId = req.params.id;
    const { name, country } = req.body;
    
    if (!name || !country) {
      return res.status(400).json({ error: 'City name and country are required' });
    }
    
    // Normalize country input
    const normalizedCountry = country.trim();
    
    // Verify city exists via OpenWeatherMap API
    if (openWeatherApiKey) {
      try {
        await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
          params: {
            q: `${name.trim()},${normalizedCountry}`,
            appid: openWeatherApiKey
          }
        });
      } catch (error) {
        return res.status(400).json({ 
          error: 'City not found in weather service. Please verify the city name and country.' 
        });
      }
    }
    
    const record = await pb.collection('locations').update(cityId, {
      name: name.trim(),
      country: normalizedCountry
    });
    
    res.json(record);
  } catch (error) {
    console.error('Error updating city:', error);
    if (error.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to update city' });
    }
  }
});

// Delete a city
app.delete('/cities/:id', async (req, res) => {
  try {
    const cityId = req.params.id;
    
    // Get city info before deletion
    const city = await pb.collection('locations').getOne(cityId);
    
    // Check if any collectors are currently using this city
    const activeCollectorsForCity = Array.from(runningCollectors.values())
      .filter(collector => collector.location === city.name);
    
    if (activeCollectorsForCity.length > 0) {
      return res.status(409).json({ 
        error: `Cannot delete city ${city.name}. ${activeCollectorsForCity.length} active collector(s) are using this location. Please stop all collectors for this city first.`,
        activeCollectors: activeCollectorsForCity
      });
    }
    
    await pb.collection('locations').delete(cityId);
    
    res.json({ 
      message: 'City deleted successfully',
      deletedCity: city
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    if (error.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete city' });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Collector service running at http://localhost:${port}`);
  console.log(`OpenWeatherMap API key status: ${openWeatherApiKey ? 'Provided' : 'Not provided'}`);
  console.log(`Using API key: ${openWeatherApiKey ? openWeatherApiKey.substring(0, 5) + '...' : 'None'}`);
}); 