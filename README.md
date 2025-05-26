# Weather App - Cloud-Native Microservice

A simple cloud-native microservice application for collecting and displaying current weather data.

## Architecture

- **Frontend** (Svelte): Modern web interface for displaying current weather
- **Backend** (Express): Management API for collector services  
- **Collector Service** (Node.js): Microservice for fetching weather data from OpenWeatherMap
- **Database** (PocketBase): Data storage

## Quick Start

### Development Setup

1. Install dependencies:
```bash
cd frontend && npm install
cd ../backend && npm install  
cd ../collector-service && npm install
```

2. Set up environment:
```bash
cp .env-example .env
# Add your OpenWeatherMap API key to .env
```

3. Start services:
```bash
# Terminal 1: Start PocketBase
cd pocketbase && ./pocketbase serve

# Terminal 2: Set up database and add locations (if needed)
cd pocketbase && node add-gaziantep.js

# Terminal 3: Start Backend
cd backend && npm run dev

# Terminal 4: Start Collector Service  
cd collector-service && npm run dev

# Terminal 5: Start Frontend
cd frontend && npm run dev
```

### Docker Setup

```bash
cp .env-example .env
# Add your OpenWeatherMap API key to .env
docker-compose up -d
```

## API Endpoints

**Backend:**
- `GET /api/collectors` - List running collectors
- `POST /api/collectors` - Start new collector
- `DELETE /api/collectors/:id` - Stop collector
- `GET /api/weather/:location` - Get weather data
- `GET /api/locations` - Get all locations

**Collector Service:**
- `POST /collect` - Start data collection
- `DELETE /collect/:id` - Stop collection
- `GET /collectors` - List active collectors

## Troubleshooting

### Temperature Data Issues
If you're getting incorrect temperature data for specific cities:

1. **Check API Key**: Make sure you have a valid OpenWeatherMap API key in your `.env-local` files
2. **Add Location Properly**: Ensure your city is added to the database with the correct country code
   - For Turkish cities like Gaziantep, use country code 'TR'
   - Run: `cd pocketbase && node add-gaziantep.js` to add Turkish cities
3. **Verify API Calls**: Check the collector service logs to see the actual API responses
4. **Location Format**: The API works best with format "City,CountryCode" (e.g., "Gaziantep,TR")

### Common Issues
- **Mock Data**: If you see "Mock Data" in the source, your API key is not set properly
- **404 Errors**: Make sure PocketBase is running and collections are created
- **CORS Issues**: Ensure all services are running on the specified ports

## Technologies

- Frontend: Svelte, SvelteKit
- Backend: Express.js, Node.js
- Database: PocketBase
- Weather API: OpenWeatherMap
- Containers: Docker, Docker Compose 