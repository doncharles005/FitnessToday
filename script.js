// Function to register the Service Worker
function registerServiceWorker() {
  // Check if the browser supports Service Workers
  if ('serviceWorker' in navigator) {
    // Add a 'load' event listener to the window.
    // This ensures the Service Worker registration happens after the page has fully loaded,
    // which is a good practice to not block the main thread.
    window.addEventListener('load', () => {
      // Register the Service Worker. The path '/sw.js' assumes sw.js is in the root directory.
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // Service Worker registration was successful
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          // Service Worker registration failed
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    console.warn('Service Workers are not supported in this browser.');
  }
}

// Function to set the active navigation link based on the current page
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav ul li a');

  navLinks.forEach(link => {
    // Remove 'active' class from all links first
    link.classList.remove('active');

    // Determine the href path for comparison
    const linkPath = link.getAttribute('href');

    // Check if the current path matches the link's href
    // Handle root path '/' explicitly for index.html
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    }
  });
}

// Call the functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  setActiveNavLink(); // Set active class on page load
});

// Example of a simple interactive element (optional)
// You could add more complex logic here for your PWA features.
const navToggleButton = document.getElementById('nav-toggle-btn');
if (navToggleButton) {
  navToggleButton.addEventListener('click', () => {
    console.log('Navigation toggle button clicked!');
    // In a real app, this would toggle a mobile navigation menu
    alert('Navigation menu would toggle here!');
  });
}
