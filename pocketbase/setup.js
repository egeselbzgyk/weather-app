const PocketBase = require('pocketbase/cjs');

require('dotenv').config({ path: '.env-local' });

const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error('Error: POCKETBASE_ADMIN_PASSWORD environment variable is required');
    process.exit(1);
}

async function main() {
    const pb = new PocketBase('http://localhost:8090');

    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('Successfully authenticated with PocketBase admin');
    } catch (error) {
        console.error('Error authenticating with PocketBase:', error);
        console.log('\nPlease make sure:');
        console.log('1. PocketBase is running at http://localhost:8090');
        console.log('2. You have set the correct POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in your .env-local file');
        process.exit(1);
    }
}

main().catch(console.error);

async function setupCollections() {
  try {
    console.log('Setting up PocketBase collections...');
    
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