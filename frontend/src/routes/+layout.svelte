<script>
  // Add global styles here
</script>

<nav>
  <div class="container">
    <a href="/" class="brand">🌤️ Weather Now</a>
    <div class="nav-links">
      <a href="/">Weather</a>
      <a href="/collectors">Manage</a>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  nav {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
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
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }
  
  .nav-links a:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  main {
    padding: 2rem 0;
    min-height: calc(100vh - 80px);
  }
  
  @media (max-width: 640px) {
    .nav-links {
      gap: 1rem;
    }
    
    .nav-links a {
      padding: 0.25rem 0.5rem;
      font-size: 0.9rem;
    }
    
    .brand {
      font-size: 1.2rem;
    }
  }
</style> 