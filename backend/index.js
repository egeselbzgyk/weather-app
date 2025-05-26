const express = require('express');
const cors = require('cors');
const axios = require('axios');
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;
const collectorServiceUrl = process.env.COLLECTOR_SERVICE_URL || 'http://localhost:3001';
const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';

// Middleware
app.use(cors());
app.use(express.json());

// PocketBase client
const pb = new PocketBase(pocketbaseUrl);

// Store running collector instances
const runningCollectors = new Map();

// Routes
app.get('/api/collectors', (req, res) => {
  const collectors = Array.from(runningCollectors.values());
  res.json(collectors);
});

app.post('/api/collectors', async (req, res) => {
  try {
    const { location, attribute, interval } = req.body;
    
    if (!location || !attribute || !interval) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Start a new collector via the collector service
    const response = await axios.post(`${collectorServiceUrl}/collect`, {
      location,
      attribute,
      interval
    });
    
    const collectorId = response.data.id;
    
    // Store collector info
    runningCollectors.set(collectorId, {
      id: collectorId,
      location,
      attribute,
      interval,
      startTime: new Date()
    });
    
    res.status(201).json(runningCollectors.get(collectorId));
  } catch (error) {
    console.error('Error starting collector:', error);
    res.status(500).json({ error: 'Failed to start collector' });
  }
});

app.delete('/api/collectors/:id', async (req, res) => {
  try {
    const collectorId = req.params.id;
    
    if (!runningCollectors.has(collectorId)) {
      return res.status(404).json({ error: 'Collector not found' });
    }
    
    // Stop the collector via the collector service
    await axios.delete(`${collectorServiceUrl}/collect/${collectorId}`);
    
    // Remove from running collectors
    const collector = runningCollectors.get(collectorId);
    runningCollectors.delete(collectorId);
    
    res.json({ message: 'Collector stopped', collector });
  } catch (error) {
    console.error('Error stopping collector:', error);
    res.status(500).json({ error: 'Failed to stop collector' });
  }
});

// API endpoint to fetch weather data from PocketBase
app.get('/api/weather/:location', async (req, res) => {
  try {
    const location = req.params.location;
    
    // Query PocketBase for weather data
    const records = await pb.collection('weather_data').getList(1, 50, {
      filter: `location = "${location}"`,
      sort: '-created'
    });
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// API endpoint to get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const records = await pb.collection('locations').getFullList();
    res.json(records);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
}); 