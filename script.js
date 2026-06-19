/**
 * HAFIZ AHMED - PORTFOLIO JS
 * Handles the "Roast My Website" AI logic via Serverless Function
 */

document.addEventListener('DOMContentLoaded', () => {
  const roastBtn = document.getElementById('roast-btn');
  const urlInput = document.getElementById('url-input');
  const loader = document.getElementById('roast-loader');
  const resultContainer = document.getElementById('roast-result-container');
  const resultDiv = document.getElementById('roast-result');

  roastBtn.addEventListener('click', async () => {
    const targetUrl = urlInput.value.trim();

    // Validation
    if (!targetUrl) {
      alert("Please enter a valid URL to roast.");
      return;
    }

    // UI State: Loading
    roastBtn.disabled = true;
    loader.classList.add('active');
    resultContainer.classList.remove('active');
    resultDiv.innerHTML = '';

    try {
      // Call the Vercel Serverless Function
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: targetUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to roast the website.");
      }
      
      // Use marked.js to render the markdown response safely into HTML
      resultDiv.innerHTML = marked.parse(data.roast);
      resultContainer.classList.add('active');

    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = `<p style="color: #c62828; font-weight: bold;">Error: ${error.message}</p>`;
      resultContainer.classList.add('active');
    } finally {
      // UI State: Reset
      roastBtn.disabled = false;
      loader.classList.remove('active');
    }
  });
});
