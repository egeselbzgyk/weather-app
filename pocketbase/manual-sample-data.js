const axios = require('axios');

const pocketbaseUrl = 'http://localhost:8090';

async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Create sample locations
    const locations = [
      { name: 'Berlin', country: 'Germany' },
      { name: 'London', country: 'United Kingdom' },
      { name: 'Paris', country: 'France' },
      { name: 'New York', country: 'USA' },
      { name: 'Tokyo', country: 'Japan' }
    ];
    
    for (const location of locations) {
      try {
        await axios.post(`${pocketbaseUrl}/api/collections/locations/records`, location);
        console.log(`Created location: ${location.name}, ${location.country}`);
      } catch (error) {
        console.error(`Error creating location ${location.name}:`, error.message);
      }
    }
    
    // Create sample weather data
    const weatherData = [
      { location: 'Berlin', attribute: 'temperature', value: 22.5, timestamp: new Date().toISOString(), source: 'Sample Data' },
      { location: 'Berlin', attribute: 'humidity', value: 65, timestamp: new Date().toISOString(), source: 'Sample Data' },
      { location: 'London', attribute: 'temperature', value: 18.2, timestamp: new Date().toISOString(), source: 'Sample Data' },
      { location: 'London', attribute: 'humidity', value: 78, timestamp: new Date().toISOString(), source: 'Sample Data' },
      { location: 'Paris', attribute: 'temperature', value: 24.8, timestamp: new Date().toISOString(), source: 'Sample Data' },
      { location: 'Paris', attribute: 'humidity', value: 55, timestamp: new Date().toISOString(), source: 'Sample Data' }
    ];
    
    for (const data of weatherData) {
      try {
        await axios.post(`${pocketbaseUrl}/api/collections/weather_data/records`, data);
        console.log(`Created weather data: ${data.location}, ${data.attribute}: ${data.value}`);
      } catch (error) {
        console.error(`Error creating weather data for ${data.location}:`, error.message);
      }
    }
    
    console.log('Sample data creation complete');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData(); 