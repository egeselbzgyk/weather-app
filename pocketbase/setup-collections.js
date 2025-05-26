const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8090');

async function setupCollections() {
  try {
    console.log('Setting up PocketBase collections...');
    
    // Try to authenticate as admin
    try {
      await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com',
        process.env.POCKETBASE_ADMIN_PASSWORD || 'password123'
      );
      console.log('Admin authentication successful');
    } catch (error) {
      console.error('Admin authentication failed:', error);
      return;
    }
    
    // Create locations collection if it doesn't exist
    try {
      await pb.collections.getOne('locations');
      console.log('Locations collection already exists');
    } catch (error) {
      if (error.status === 404) {
        console.log('Creating locations collection...');
        await pb.collections.create({
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
      } else {
        console.error('Error checking locations collection:', error);
      }
    }
    
    // Create weather_data collection if it doesn't exist
    try {
      await pb.collections.getOne('weather_data');
      console.log('Weather data collection already exists');
    } catch (error) {
      if (error.status === 404) {
        console.log('Creating weather_data collection...');
        await pb.collections.create({
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
      } else {
        console.error('Error checking weather_data collection:', error);
      }
    }
    
    console.log('PocketBase collections setup complete');
  } catch (error) {
    console.error('Error setting up collections:', error);
  }
}

setupCollections(); 