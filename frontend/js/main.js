// Main JavaScript
function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
    });
}

// Load landing page by default
loadPage('landing');