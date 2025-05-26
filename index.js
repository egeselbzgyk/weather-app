// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(location, attribute) {
  try {
    // If no API key is provided, use mock data
    if (!openWeatherApiKey || openWeatherApiKey.includes('your_')) {
      console.log(`Using mock data for ${location}, ${attribute}`);
      // Generate random value based on attribute
      let value;
      switch (attribute.toLowerCase()) {
        case 'temperature':
          value = 15 + Math.random() * 15; // Random between 15-30
          break;
        case 'humidity':
          value = 40 + Math.random() * 40; // Random between 40-80
          break;
        case 'pressure':
          value = 980 + Math.random() * 40; // Random between 980-1020
          break;
        case 'wind_speed':
          value = Math.random() * 10; // Random between 0-10
          break;
        default:
          throw new Error(`Unsupported attribute: ${attribute}`);
      }
      
      return {
        location,
        attribute,
        value,
        timestamp: new Date(),
        source: 'Mock Data'
      };
    }
    
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: location,
        appid: openWeatherApiKey,
        units: 'metric'
      }
    });
    
    let value;
    
    // Extract the requested attribute from the response
    switch (attribute.toLowerCase()) {
      case 'temperature':
        value = response.data.main.temp;
        break;
      case 'humidity':
        value = response.data.main.humidity;
        break;
      case 'pressure':
        value = response.data.main.pressure;
        break;
      case 'wind_speed':
        value = response.data.wind.speed;
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

// Routes
app.post('/collect', (req, res) => {
  try {
    const { location, attribute, interval } = req.body;
    
    if (!location || !attribute || !interval) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const collectorId = uuidv4();
    
    // ... rest of the function ...
  } catch (error) {
    console.error('Error in /collect route:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}); 