const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8090');

// Please update these with your actual admin credentials
// that you created when first running PocketBase
const ADMIN_EMAIL = 'YOUR_ACTUAL_EMAIL'; // Replace with your actual email
const ADMIN_PASSWORD = 'YOUR_ACTUAL_PASSWORD'; // Replace with your actual password

async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Try to authenticate as admin
    try {
      await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('Admin authentication successful');
    } catch (error) {
      console.error('Admin authentication failed:', error);
      console.log('\nPlease update the ADMIN_EMAIL and ADMIN_PASSWORD in this script with your actual PocketBase admin credentials.');
      console.log('You can find these credentials in the PocketBase admin UI at http://localhost:8090/_/');
      return;
    }
    
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
        const record = await pb.collection('locations').create(location);
        console.log(`Created location: ${location.name}, ${location.country}`);
      } catch (error) {
        console.error(`Error creating location ${location.name}:`, error);
      }
    }
    
    // Create sample weather data
    const weatherData = [
      { location: 'Berlin', attribute: 'temperature', value: 22.5, timestamp: new Date(), source: 'Sample Data' },
      { location: 'Berlin', attribute: 'humidity', value: 65, timestamp: new Date(), source: 'Sample Data' },
      { location: 'London', attribute: 'temperature', value: 18.2, timestamp: new Date(), source: 'Sample Data' },
      { location: 'London', attribute: 'humidity', value: 78, timestamp: new Date(), source: 'Sample Data' },
      { location: 'Paris', attribute: 'temperature', value: 24.8, timestamp: new Date(), source: 'Sample Data' },
      { location: 'Paris', attribute: 'humidity', value: 55, timestamp: new Date(), source: 'Sample Data' }
    ];
    
    for (const data of weatherData) {
      try {
        const record = await pb.collection('weather_data').create(data);
        console.log(`Created weather data: ${data.location}, ${data.attribute}: ${data.value}`);
      } catch (error) {
        console.error(`Error creating weather data for ${data.location}:`, error);
      }
    }
    
    console.log('Sample data creation complete');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData(); 