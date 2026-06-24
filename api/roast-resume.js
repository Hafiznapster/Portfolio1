export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fileData, mimeType, text } = req.body;

  if (!fileData && !text) {
    return res.status(400).json({ error: 'No resume content provided. Please upload a PDF or DOCX file.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const SYSTEM_PROMPT = `You are a ruthless, sarcastic, and hilariously brutal technical recruiter and career coach. Your job is to completely ROAST the provided resume.

Tear apart their buzzwords, confusing formatting, lackluster achievements, grammatical errors, or any generic filler you find cringeworthy. Be witty, be harsh, but make it genuinely funny and entertaining. 

Format your response exactly like this:
1. A punchy, insulting opening sentence about the overall vibe of the resume.
2. 2-3 short paragraphs roasting specific parts of their experience, skills, or projects.
3. A bulleted list of the "Top 3 Biggest Offenses".
4. A final "Roast Score" out of 10 (with 0/10 being the absolute worst).

Here is the resume content:
`;

    // Prepare contents based on whether we received inlineData (PDF) or extracted text (DOCX)
    let parts = [];
    
    if (fileData && mimeType) {
      // PDF base64 format
      parts = [
        { text: SYSTEM_PROMPT },
        {
          inlineData: {
            mimeType: mimeType,
            data: fileData
          }
        }
      ];
    } else if (text) {
      // Extracted text format (from DOCX)
      // Truncate text just in case it's huge
      const truncatedText = text.substring(0, 100000);
      parts = [
        { text: SYSTEM_PROMPT + "\n\n" + truncatedText }
      ];
    }

    // Call Gemini API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
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
    console.error('Error during resume roasting:', error);
    return res.status(500).json({ error: error.message });
  }
}
