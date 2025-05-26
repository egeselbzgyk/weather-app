const axios = require('axios');

const pocketbaseUrl = 'http://localhost:8090';

async function setupCollections() {
  try {
    console.log('Setting up PocketBase collections manually...');
    
    // Create locations collection
    try {
      console.log('Creating locations collection...');
      await axios.post(`${pocketbaseUrl}/api/collections`, {
        name: 'locations',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true
          },
          {
            name: 'country',
            type: 'text',
            required: true
          }
        ]
      });
      console.log('Locations collection created');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('Locations collection already exists');
      } else {
        console.error('Error creating locations collection:', error.message);
      }
    }
    
    // Create weather_data collection
    try {
      console.log('Creating weather_data collection...');
      await axios.post(`${pocketbaseUrl}/api/collections`, {
        name: 'weather_data',
        type: 'base',
        schema: [
          {
            name: 'location',
            type: 'text',
            required: true
          },
          {
            name: 'attribute',
            type: 'text',
            required: true
          },
          {
            name: 'value',
            type: 'number',
            required: true
          },
          {
            name: 'timestamp',
            type: 'date',
            required: true
          },
          {
            name: 'source',
            type: 'text',
            required: true
          }
        ]
      });
      console.log('Weather data collection created');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('Weather data collection already exists');
      } else {
        console.error('Error creating weather_data collection:', error.message);
      }
    }
    
    console.log('PocketBase collections setup complete');
  } catch (error) {
    console.error('Error setting up collections:', error);
  }
}

setupCollections(); 