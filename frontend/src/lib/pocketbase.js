import PocketBase from 'pocketbase';

const pocketbaseUrl = 'http://localhost:8090';
const backendUrl = 'http://localhost:3003';
export const pb = new PocketBase(pocketbaseUrl);

// Function to fetch weather data from PocketBase
export async function fetchWeatherData(location) {
  try {
    const records = await pb.collection('weather_data').getList(1, 50, {
      filter: `location = "${location}"`,
      sort: '-timestamp'
    });
    return records.items;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Function to fetch all locations
export async function fetchLocations() {
  try {
    const records = await pb.collection('locations').getFullList();
    return records;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

// Function to add a new location
export async function addLocation(name, country) {
  try {
    const record = await pb.collection('locations').create({
      name,
      country
    });
    return record;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
}

// Function to start a collector
export async function startCollector(location, attribute, interval) {
  try {
    const response = await fetch(`${backendUrl}/api/collectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location,
        attribute,
        interval
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start collector: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting collector:', error);
    throw error;
  }
}

// Function to stop a collector
export async function stopCollector(collectorId) {
  try {
    const response = await fetch(`${backendUrl}/api/collectors/${collectorId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to stop collector: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error stopping collector:', error);
    throw error;
  }
}

// Function to fetch all collectors
export async function fetchCollectors() {
  try {
    const response = await fetch(`${backendUrl}/api/collectors`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collectors: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching collectors:', error);
    throw error;
  }
} 