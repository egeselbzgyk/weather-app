require('dotenv').config({ path: '.env-local' });

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('POCKETBASE_URL:', process.env.POCKETBASE_URL);
console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY); 