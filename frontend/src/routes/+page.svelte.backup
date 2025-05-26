<script>
  import { onMount } from 'svelte';
  import { fetchWeatherData, fetchLocations } from '$lib/pocketbase';
  
  let locations = [];
  let selectedLocation = '';
  let currentWeather = null;
  let loading = false;
  let error = null;
  
  onMount(async () => {
    try {
      locations = await fetchLocations();
      if (locations.length > 0) {
        selectedLocation = locations[0].name;
        await loadCurrentWeather(selectedLocation);
      }
    } catch (err) {
      error = 'Failed to load locations';
      console.error('Error loading data:', err);
    }
  });
  
  async function loadCurrentWeather(location) {
    loading = true;
    error = null;
    try {
      const weatherData = await fetchWeatherData(location);
      
      // Get the most recent data for each attribute
      const latest = {};
      weatherData.forEach(item => {
        if (!latest[item.attribute] || new Date(item.timestamp) > new Date(latest[item.attribute].timestamp)) {
          latest[item.attribute] = item;
        }
      });
      
      currentWeather = {
        location: location,
        temperature: latest.temperature?.value || 'N/A',
        humidity: latest.humidity?.value || 'N/A',
        pressure: latest.pressure?.value || 'N/A',
        windSpeed: latest.wind_speed?.value || 'N/A',
        lastUpdated: latest.temperature?.timestamp || null
      };
    } catch (err) {
      error = 'Failed to load weather data';
      console.error('Error loading weather data:', err);
    } finally {
      loading = false;
    }
  }
  
  function handleLocationChange() {
    if (selectedLocation) {
      loadCurrentWeather(selectedLocation);
    }
  }
  
  function getTemperatureColor(temp) {
    if (temp === 'N/A') return '#6b7280';
    const temperature = parseFloat(temp);
    if (temperature < 0) return '#3b82f6'; // Blue for cold
    if (temperature < 15) return '#06b6d4'; // Cyan for cool
    if (temperature < 25) return '#10b981'; // Green for mild
    if (temperature < 35) return '#f59e0b'; // Orange for warm
    return '#ef4444'; // Red for hot
  }
</script>

<svelte:head>
  <title>Weather App</title>
</svelte:head>

<div class="weather-app">
  <div class="header">
    <h1>🌤️ Weather Now</h1>
    <p>Get current weather conditions for your locations</p>
  </div>
  
  <div class="location-selector">
    <label for="location">📍 Choose Location:</label>
    <select id="location" bind:value={selectedLocation} on:change={handleLocationChange}>
      <option value="">Select a location...</option>
      {#each locations as location}
        <option value={location.name}>{location.name}</option>
      {/each}
    </select>
  </div>
  
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading weather data...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>❌ {error}</p>
      <button on:click={() => loadCurrentWeather(selectedLocation)}>Try Again</button>
    </div>
  {:else if currentWeather}
    <div class="weather-card">
      <div class="location-header">
        <h2>{currentWeather.location}</h2>
        {#if currentWeather.lastUpdated}
          <p class="last-updated">Last updated: {new Date(currentWeather.lastUpdated).toLocaleString()}</p>
        {/if}
      </div>
      
      <div class="weather-grid">
        <div class="weather-item main-temp" style="border-left-color: {getTemperatureColor(currentWeather.temperature)}">
          <div class="weather-icon">🌡️</div>
          <div class="weather-info">
            <h3>Temperature</h3>
            <p class="weather-value">{currentWeather.temperature}°C</p>
          </div>
        </div>
        
        <div class="weather-item">
          <div class="weather-icon">💧</div>
          <div class="weather-info">
            <h3>Humidity</h3>
            <p class="weather-value">{currentWeather.humidity}%</p>
          </div>
        </div>
        
        <div class="weather-item">
          <div class="weather-icon">🗜️</div>
          <div class="weather-info">
            <h3>Pressure</h3>
            <p class="weather-value">{currentWeather.pressure} hPa</p>
          </div>
        </div>
        
        <div class="weather-item">
          <div class="weather-icon">💨</div>
          <div class="weather-info">
            <h3>Wind Speed</h3>
            <p class="weather-value">{currentWeather.windSpeed} m/s</p>
          </div>
        </div>
      </div>
      
      <div class="refresh-section">
        <button class="refresh-btn" on:click={() => loadCurrentWeather(selectedLocation)}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  {:else}
    <div class="no-data">
      <div class="no-data-icon">📊</div>
      <h3>No Weather Data Available</h3>
      <p>No weather data found for {selectedLocation || 'this location'}.</p>
      <p>Make sure collectors are running to gather weather data.</p>
      <a href="/collectors" class="button">Configure Collectors</a>
    </div>
  {/if}
</div>

<style>
  .weather-app {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: #e5e7eb;
    color: #4f46e5;
    display: inline-block;
  }
  
  .header p {
    color: #ffffff;
    font-size: 1.1rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.8;
  }
  
  .location-selector {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }
  
  .location-selector label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .location-selector select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;
  }
  
  .location-selector select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .loading {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }
  
  .spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error {
    text-align: center;
    padding: 2rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 12px;
    color: #dc2626;
  }
  
  .error button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.2s;
  }
  
  .error button:hover {
    background: #b91c1c;
  }
  
  .weather-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .location-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;
  }
  
  .location-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
  }
  
  .last-updated {
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
  
  .weather-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0;
  }
  
  .weather-item {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #f3f4f6;
    border-right: 1px solid #f3f4f6;
    border-left: 4px solid #e5e7eb;
    transition: all 0.2s;
  }
  
  .weather-item:hover {
    background: #f9fafb;
  }
  
  .weather-item.main-temp {
    grid-column: span 2;
    background: #fafbff;
    border-left-width: 6px;
  }
  
  @media (max-width: 640px) {
    .weather-item.main-temp {
      grid-column: span 1;
    }
  }
  
  .weather-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }
  
  .weather-info h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .weather-value {
    margin: 0.25rem 0 0 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }
  
  .main-temp .weather-value {
    font-size: 2.5rem;
  }
  
  .refresh-section {
    padding: 1.5rem;
    text-align: center;
    background: #f9fafb;
  }
  
  .refresh-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .refresh-btn:hover {
    transform: translateY(-2px);
  }
  
  .no-data {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .no-data-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .no-data h3 {
    color: #374151;
    margin: 0 0 1rem 0;
  }
  
  .no-data p {
    color: #6b7280;
    margin: 0.5rem 0;
  }
  
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1rem;
    transition: transform 0.2s;
  }
  
  .button:hover {
    transform: translateY(-2px);
  }
</style> 