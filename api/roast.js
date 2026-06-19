export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    // 1. Scrape the website using Jina AI
    const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`);
    if (!jinaResponse.ok) {
      throw new Error("Failed to scrape the website. It might be blocking scrapers.");
    }
    const websiteMarkdown = await jinaResponse.text();

    // Ensure we don't exceed context window limits
    const truncatedContent = websiteMarkdown.substring(0, 100000);

    // 2. The Persona Prompt
    const SYSTEM_PROMPT = `You are a ruthless, sarcastic, and hilariously brutal web designer and copywriter. Your job is to completely ROAST the website content provided below.

Tear apart their confusing copy, questionable design choices (implied by the content layout), lack of clear user experience, and anything else you find cringeworthy. Be witty, be harsh, but make it genuinely funny and entertaining. 

Format your response exactly like this:
1. A punchy, insulting opening sentence.
2. 2-3 short paragraphs roasting specific parts of the text/content.
3. A bulleted list of the "Top 3 Biggest Offenses".
4. A final "Roast Score" out of 10 (with 0/10 being the absolute worst).

Here is the extracted content of the website to roast:
`;

    // 3. Call Gemini API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const promptText = `${SYSTEM_PROMPT}\n\n${truncatedContent}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(errorData.error?.message || "Failed to contact Gemini API.");
    }

    const geminiData = await geminiResponse.json();
    
    // Extract the text response
    if (geminiData.candidates && geminiData.candidates[0].content.parts[0].text) {
      const roastText = geminiData.candidates[0].content.parts[0].text;
      return res.status(200).json({ roast: roastText });
    } else {
      throw new Error("Unexpected response format from Gemini.");
    }

  } catch (error) {
    console.error('Error during roasting:', error);
    return res.status(500).json({ error: error.message });
  }
}
