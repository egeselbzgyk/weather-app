<script>
  import { onMount } from "svelte";
  import {
    fetchCities,
    addCity,
    updateCity,
    deleteCity,
    fetchCollectors,
    startCollector,
    stopCollector,
  } from "$lib/pocketbase";

  let cities = [];
  let collectors = [];
  let isLoading = false;
  let error = null;
  let success = null;

  // Form data for new collector
  let newCollector = {
    location: "",
    attribute: "temperature",
    interval: 60,
  };

  // Form data for new/edit city
  let cityForm = {
    id: "",
    name: "",
    country: "",
    isEditing: false,
  };

  // Show form modal for cities
  let showCityForm = false;

  // Available weather attributes
  const attributes = [
    { value: "temperature", label: "🌡️ Temperature" },
    { value: "humidity", label: "💧 Humidity" },
    { value: "pressure", label: "🗜️ Pressure" },
    { value: "wind_speed", label: "💨 Wind Speed" },
  ];

  // Common country codes for convenience
  const commonCountries = [
    "DE",
    "US",
    "GB",
    "FR",
    "IT",
    "ES",
    "CH",
    "AT",
    "NL",
    "BE",
    "CA",
    "AU",
    "JP",
    "CN",
    "IN",
    "BR",
    "RU",
    "TR",
    "PL",
    "SE",
  ];

  onMount(async () => {
    await Promise.all([loadCities(), loadCollectors()]);
  });

  async function loadCities() {
    try {
      cities = await fetchCities();
      if (cities.length > 0 && !newCollector.location) {
        newCollector.location = cities[0].name;
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  }

  async function loadCollectors() {
    try {
      isLoading = true;
      collectors = await fetchCollectors();
    } catch (err) {
      error = "Failed to load collectors";
      console.error(error, err);
    } finally {
      isLoading = false;
    }
  }

  // Collector Functions
  async function handleSubmitCollector() {
    try {
      if (
        !newCollector.location ||
        !newCollector.attribute ||
        !newCollector.interval
      ) {
        error = "Please fill in all fields";
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

      success = "Collector started successfully! 🎉";
      await loadCollectors();
    } catch (err) {
      error = "Failed to start collector";
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

      success = "Collector stopped successfully! ✅";
      await loadCollectors();
    } catch (err) {
      error = "Failed to stop collector";
      console.error(error, err);
    } finally {
      isLoading = false;
    }
  }

  // City Functions
  function openAddCityForm() {
    cityForm = {
      id: "",
      name: "",
      country: "",
      isEditing: false,
    };
    showCityForm = true;
    clearMessages();
  }

  function openEditCityForm(city) {
    cityForm = {
      id: city.id,
      name: city.name,
      country: city.country,
      isEditing: true,
    };
    showCityForm = true;
    clearMessages();
  }

  function closeCityForm() {
    showCityForm = false;
    cityForm = {
      id: "",
      name: "",
      country: "",
      isEditing: false,
    };
  }

  async function handleSubmitCity() {
    try {
      if (!cityForm.name.trim() || !cityForm.country.trim()) {
        error = "Please fill in both city name and country";
        success = null;
        return;
      }

      isLoading = true;
      error = null;
      success = null;

      if (cityForm.isEditing) {
        await updateCity(cityForm.id, cityForm.name, cityForm.country);
        success = "City updated successfully! ✅";
      } else {
        await addCity(cityForm.name, cityForm.country);
        success = "City added successfully! 🎉";
      }

      await loadCities();
      closeCityForm();
    } catch (err) {
      error = err.message || "Failed to save city";
      console.error(error, err);
    } finally {
      isLoading = false;
    }
  }

  async function handleDeleteCity(city) {
    if (
      !confirm(
        `Are you sure you want to delete "${city.name}, ${city.country}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      isLoading = true;
      error = null;
      success = null;

      await deleteCity(city.id);
      success = "City deleted successfully! 🗑️";
      await loadCities();
    } catch (err) {
      error = err.message || "Failed to delete city";
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
  <title>Weather Management - Cities & Collectors</title>
</svelte:head>

<div class="management-page">
  <div class="header">
    <h1>⚙️ Weather Management</h1>
    <p>Manage your cities and collectors in one place</p>
  </div>

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

  <!-- Cities Management Section -->
  <div class="section-card">
    <div class="section-header">
      <h2>🏙️ Cities Management</h2>
      <button class="add-btn" on:click={openAddCityForm} disabled={isLoading}>
        ➕ Add City
      </button>
    </div>

    {#if isLoading && cities.length === 0}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading cities...</p>
      </div>
    {:else if cities.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🌆</div>
        <h3>No Cities Found</h3>
        <p>
          Add your first city to start collecting weather data, or check if the
          collector service is running.
        </p>
        <button class="add-btn" on:click={openAddCityForm}>
          ➕ Add First City
        </button>
      </div>
    {:else}
      <div class="cities-grid">
        {#each cities as city}
          <div class="city-item">
            <div class="city-header">
              <h3>{city.name}</h3>
              <div class="city-actions">
                <button
                  class="edit-btn"
                  on:click={() => openEditCityForm(city)}
                  disabled={isLoading}
                  title="Edit city"
                >
                  ✏️
                </button>
                <button
                  class="delete-btn"
                  on:click={() => handleDeleteCity(city)}
                  disabled={isLoading}
                  title="Delete city"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div class="city-details">
              <div class="detail">
                <span class="label">Country:</span>
                <span class="value">{city.country}</span>
              </div>
              <div class="detail">
                <span class="label">Added:</span>
                <span class="value"
                  >{new Date(city.created).toLocaleDateString()}</span
                >
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Collectors Management Section -->
  <div class="section-card">
    <div class="section-header">
      <h2>🚀 Collectors Management</h2>
    </div>

    <!-- Start New Collector Form -->
    <div class="collector-form">
      <h3>Start New Collector</h3>
      <form on:submit|preventDefault={handleSubmitCollector}>
        <div class="form-grid">
          <div class="form-group">
            <label for="location">📍 Location</label>
            <select id="location" bind:value={newCollector.location} required>
              <option value="">Select a location</option>
              {#each cities as city}
                <option value={city.name}>{city.name}, {city.country}</option>
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

    <!-- Active Collectors -->
    <div class="collectors-section">
      <h3>🔄 Active Collectors</h3>

      {#if isLoading && collectors.length === 0}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading collectors...</p>
        </div>
      {:else if collectors.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h4>No Active Collectors</h4>
          <p>Start your first collector to begin gathering weather data.</p>
        </div>
      {:else}
        <div class="collectors-grid">
          {#each collectors as collector}
            <div class="collector-item">
              <div class="collector-header">
                <h4>{collector.location}</h4>
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
                  <span class="value"
                    >{new Date(collector.startTime).toLocaleString()}</span
                  >
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- City Form Modal -->
{#if showCityForm}
  <div
    class="modal-overlay"
    on:click={closeCityForm}
    on:keydown={(e) => e.key === "Escape" && closeCityForm()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <div
      class="modal-content"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title">
          {cityForm.isEditing ? "✏️ Edit City" : "➕ Add New City"}
        </h2>
        <button class="close-btn" on:click={closeCityForm}>×</button>
      </div>

      <form on:submit|preventDefault={handleSubmitCity}>
        <div class="form-group">
          <label for="cityName">🏙️ City Name</label>
          <input
            type="text"
            id="cityName"
            bind:value={cityForm.name}
            placeholder="e.g., Berlin, Munich, Hamburg"
            required
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label for="country">🌍 Country Code</label>
          <input
            type="text"
            id="country"
            bind:value={cityForm.country}
            placeholder="e.g., DE, US, GB or Germany, France"
            maxlength="20"
            title="Please enter a 2-letter country code (e.g., DE, US, GB) or full country name"
            required
            autocomplete="country"
            on:input={(e) => {
              // Allow both 2-letter codes and full names
              cityForm.country = e.target.value;
            }}
          />

          <div class="country-hints">
            <p class="hint-text">Common country codes:</p>
            <div class="country-tags">
              {#each commonCountries as countryCode}
                <button
                  type="button"
                  class="country-tag"
                  on:click={() => (cityForm.country = countryCode)}
                >
                  {countryCode}
                </button>
              {/each}
            </div>
            <p class="hint-text" style="margin-top: 0.5rem;">
              Or use full names like: Germany, France, Turkey
            </p>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" on:click={closeCityForm}>
            Cancel
          </button>
          <button type="submit" class="submit-btn" disabled={isLoading}>
            {#if isLoading}
              <div class="spinner-small"></div>
              {cityForm.isEditing ? "Updating..." : "Adding..."}
            {:else}
              {cityForm.isEditing ? "✅ Update City" : "➕ Add City"}
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .management-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #f7f7f7;
    margin: 0;
    background: #f0fdf4;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header p {
    color: #d3d3d3;
    font-size: 1.2rem;
    margin: 0.5rem 0 0 0;
  }

  .alert {
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
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

  .section-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .section-header h2 {
    color: #1f2937;
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
  }

  .add-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -3px rgba(102, 126, 234, 0.3);
  }

  .add-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3,
  .empty-state h4 {
    color: #374151;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    color: #6b7280;
    margin: 0 0 1.5rem 0;
  }

  .cities-grid,
  .collectors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .city-item,
  .collector-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .city-item:hover,
  .collector-item:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -3px rgba(0, 0, 0, 0.1);
  }

  .city-header,
  .collector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .city-header h3,
  .collector-header h4 {
    color: #1f2937;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .city-actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn,
  .delete-btn,
  .stop-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    border-radius: 6px;
    padding: 0.25rem;
  }

  .edit-btn:hover:not(:disabled) {
    opacity: 1;
    background: #f3f4f6;
  }

  .delete-btn:hover:not(:disabled),
  .stop-btn:hover:not(:disabled) {
    opacity: 1;
    background: #fef2f2;
  }

  .edit-btn:disabled,
  .delete-btn:disabled,
  .stop-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .city-details,
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

  .collector-form {
    border-top: 1px solid #e5e7eb;
    padding-top: 2rem;
    margin-bottom: 2rem;
  }

  .collector-form h3 {
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .collectors-section h3 {
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    font-size: 1.3rem;
    font-weight: 600;
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

  input,
  select {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;
  }

  input:focus,
  select:focus {
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1.5rem;
  }

  .modal-header h2 {
    color: #1f2937;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .modal-content form {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .modal-content .form-group {
    margin-bottom: 1.5rem;
  }

  .modal-content input {
    width: 100%;
    box-sizing: border-box;
  }

  .country-hints {
    margin-top: 0.75rem;
  }

  .hint-text {
    color: #6b7280;
    font-size: 0.8rem;
    margin: 0 0 0.5rem 0;
  }

  .country-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .country-tag {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .country-tag:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #e5e7eb;
  }

  .submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -2px rgba(102, 126, 234, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .cities-grid,
    .collectors-grid {
      grid-template-columns: 1fr;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .modal-content {
      margin: 1rem;
    }
  }
</style>
