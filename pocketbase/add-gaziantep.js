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

        // Add Gaziantep data
        const data = {
            name: 'Gaziantep',
            latitude: 37.0662,
            longitude: 37.3833
        };

        const record = await pb.collection('cities').create(data);
        console.log('Successfully added Gaziantep:', record);
    } catch (error) {
        console.error('Error:', error);
        console.log('\nPlease make sure:');
        console.log('1. PocketBase is running at http://localhost:8090');
        console.log('2. You have set the correct POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in your .env-local file');
        process.exit(1);
    }
}

main().catch(console.error); 