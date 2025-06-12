<script>
  // Add global styles here
  import { page } from '$app/stores';
</script>

<nav>
  <div class="container">
    <a href="/" class="brand">🌤️ Weather Now</a>
    <div class="nav-links">
      <a href="/">Weather</a>
      <a href="/collectors" class="manage-link">⚙️ Manage</a>
    </div>
  </div>
</nav>

<main>
  <div class="container">
    <slot />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  nav {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  nav .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-decoration: none;
    transition: transform 0.2s;
  }

  .brand:hover {
    transform: scale(1.05);
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-links a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nav-links a:hover, .nav-links a.manage-link:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-1px);
  }

  .manage-link {
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  main {
    min-height: calc(100vh - 80px);
    padding: 2rem 0;
  }

  @media (max-width: 640px) {
    nav .container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .nav-links {
      gap: 1rem;
    }
  }
</style> 