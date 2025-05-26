<script>
  import { onMount } from 'svelte';
  import { fetchLocations, fetchCollectors, startCollector, stopCollector } from '$lib/pocketbase';
  
  let locations = [];
  let collectors = [];
  let isLoading = false;
  let error = null;
  let success = null;
  
  // Form data for new collector
  let newCollector = {
    location: '',
    attribute: 'temperature',
    interval: 60
  };
  
  // Available weather attributes
  const attributes = [
    { value: 'temperature', label: '🌡️ Temperature' },
    { value: 'humidity', label: '💧 Humidity' },
    { value: 'pressure', label: '🗜️ Pressure' },
    { value: 'wind_speed', label: '💨 Wind Speed' }
  ];
  
  onMount(async () => {
    await Promise.all([
      loadLocations(),
      loadCollectors()
    ]);
  });
  
  async function loadLocations() {
    try {
      locations = await fetchLocations();
      if (locations.length > 0 && !newCollector.location) {
        newCollector.location = locations[0].name;
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  }
  
  async function loadCollectors() {
    try {
      isLoading = true;
      collectors = await fetchCollectors();
    } catch (err) {
      error = 'Failed to load collectors';
      console.error(error, err);
    } finally {
      isLoading = false;
    }
  }
  
  async function handleSubmit() {
    try {
      if (!newCollector.location || !newCollector.attribute || !newCollector.interval) {
        error = 'Please fill in all fields';
        success = null;
        return;
      }
      
      isLoading = true;
      error = null;
      success = null;
      
      await startCollector(
        newCollector.location,
        newCollector.attribute,
        parseInt(newCollector.interval)
      );
      
      success = 'Collector started successfully! 🎉';
      await loadCollectors();
    } catch (err) {
      error = 'Failed to start collector';
      console.error(error, err);
    } finally {
      isLoading = false;
    }
  }
  
  async function handleStopCollector(collectorId) {
    try {
      isLoading = true;
      error = null;
      success = null;
      
      await stopCollector(collectorId);
      
      success = 'Collector stopped successfully! ✅';
      await loadCollectors();
    } catch (err) {
      error = 'Failed to stop collector';
      console.error(error, err);
    } finally {
      isLoading = false;
    }
  }
  
  function clearMessages() {
    error = null;
    success = null;
  }
</script>

<svelte:head>
  <title>Manage Weather Collectors</title>
</svelte:head>

<div class="collectors-page">
  <div class="header">
    <h1>⚙️ Manage Collectors</h1>
    <p>Configure weather data collection for your locations</p>
  </div>
  
  <div class="form-card">
    <h2>🚀 Start New Collector</h2>
    
    {#if error}
      <div class="alert error">
        <span>❌ {error}</span>
        <button class="close-btn" on:click={clearMessages}>×</button>
      </div>
    {/if}
    
    {#if success}
      <div class="alert success">
        <span>{success}</span>
        <button class="close-btn" on:click={clearMessages}>×</button>
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-grid">
        <div class="form-group">
          <label for="location">📍 Location</label>
          <select id="location" bind:value={newCollector.location} required>
            <option value="">Select a location</option>
            {#each locations as location}
              <option value={location.name}>{location.name}, {location.country}</option>
            {/each}
          </select>
        </div>
        
        <div class="form-group">
          <label for="attribute">📊 Weather Attribute</label>
          <select id="attribute" bind:value={newCollector.attribute} required>
            {#each attributes as attribute}
              <option value={attribute.value}>{attribute.label}</option>
            {/each}
          </select>
        </div>
        
        <div class="form-group">
          <label for="interval">⏱️ Interval (seconds)</label>
          <input 
            type="number" 
            id="interval" 
            bind:value={newCollector.interval} 
            min="10"
            placeholder="60"
            required
          />
        </div>
      </div>
      
      <button type="submit" class="start-btn" disabled={isLoading}>
        {#if isLoading}
          <div class="spinner-small"></div>
          Starting...
        {:else}
          🚀 Start Collector
        {/if}
      </button>
    </form>
  </div>
  
  <div class="collectors-card">
    <h2>🔄 Active Collectors</h2>
    
    {#if isLoading && collectors.length === 0}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading collectors...</p>
      </div>
    {:else if collectors.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No Active Collectors</h3>
        <p>Start your first collector to begin gathering weather data.</p>
      </div>
    {:else}
      <div class="collectors-grid">
        {#each collectors as collector}
          <div class="collector-item">
            <div class="collector-header">
              <h3>{collector.location}</h3>
              <button 
                class="stop-btn" 
                on:click={() => handleStopCollector(collector.id)}
                disabled={isLoading}
                title="Stop collector"
              >
                🛑
              </button>
            </div>
            <div class="collector-details">
              <div class="detail">
                <span class="label">Attribute:</span>
                <span class="value">{collector.attribute}</span>
              </div>
              <div class="detail">
                <span class="label">Interval:</span>
                <span class="value">{collector.interval}s</span>
              </div>
              <div class="detail">
                <span class="label">Started:</span>
                <span class="value">{new Date(collector.startTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .collectors-page {
    max-width: 900px;
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
    color: #1f2937;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .header p {
    color: #6b7280;
    font-size: 1.1rem;
    margin: 0.5rem 0 0 0;
  }
  
  .form-card, .collectors-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
  }
  
  .form-card h2, .collectors-card h2 {
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .alert {
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  
  .success {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .close-btn:hover {
    opacity: 1;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  input, select {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .start-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
  }
  
  .start-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -3px rgba(102, 126, 234, 0.3);
  }
  
  .start-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-state {
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
  
  .empty-state {
    text-align: center;
    padding: 3rem;
  }
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .empty-state h3 {
    color: #374151;
    margin: 0 0 0.5rem 0;
  }
  
  .empty-state p {
    color: #6b7280;
    margin: 0;
  }
  
  .collectors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .collector-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s;
  }
  
  .collector-item:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -3px rgba(0, 0, 0, 0.1);
  }
  
  .collector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .collector-header h3 {
    color: #1f2937;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .stop-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    border-radius: 6px;
    padding: 0.25rem;
  }
  
  .stop-btn:hover:not(:disabled) {
    opacity: 1;
    transform: scale(1.1);
  }
  
  .stop-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .collector-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .label {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .value {
    color: #1f2937;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .collectors-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 