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

  // --- ROAST MY RESUME LOGIC ---
  const resumeInput = document.getElementById('resume-input');
  const fileNameDisplay = document.getElementById('file-name-display');
  const roastResumeBtn = document.getElementById('roast-resume-btn');
  const resumeLoader = document.getElementById('roast-resume-loader');
  const resumeResultContainer = document.getElementById('roast-resume-result-container');
  const resumeResultDiv = document.getElementById('roast-resume-result');

  let selectedFile = null;

  resumeInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      fileNameDisplay.textContent = selectedFile.name;
      roastResumeBtn.disabled = false;
    } else {
      selectedFile = null;
      fileNameDisplay.textContent = "Drop your resume here or click to upload";
      roastResumeBtn.disabled = true;
    }
  });

  roastResumeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // UI State: Loading
    roastResumeBtn.disabled = true;
    resumeLoader.classList.add('active');
    resumeResultContainer.classList.remove('active');
    resumeResultDiv.innerHTML = '';

    try {
      let payload = {};

      if (selectedFile.type === 'application/pdf') {
        // Convert to Base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
        });
        
        payload = {
          fileData: base64Data,
          mimeType: 'application/pdf'
        };
      } else if (selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.doc')) {
        // Parse with mammoth
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        if (!result.value) {
          throw new Error("Could not extract text from the Word document.");
        }
        payload = { text: result.value };
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or Word document.");
      }

      // Call the Serverless Function
      const response = await fetch('/api/roast-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to roast the resume.");
      }
      
      resumeResultDiv.innerHTML = marked.parse(data.roast);
      resumeResultContainer.classList.add('active');

    } catch (error) {
      console.error(error);
      resumeResultDiv.innerHTML = `<p style="color: #c62828; font-weight: bold;">Error: ${error.message}</p>`;
      resumeResultContainer.classList.add('active');
    } finally {
      roastResumeBtn.disabled = false;
      resumeLoader.classList.remove('active');
    }
  });
});
