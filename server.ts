import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get OAuth2 client from request header
function getOAuth2Client(req: express.Request) {
  const token = req.headers['x-oauth-token'] as string;
  if (!token) return null;
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return oauth2Client;
}

// API routes FIRST
app.get('/api/workspace/courses', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  try {
    const classroom = google.classroom({ version: 'v1', auth });
    const response = await classroom.courses.list({
      courseStates: ['ACTIVE'],
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Classroom API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/files', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink)',
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Drive API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workspace/forms', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  try {
    const drive = google.drive({ version: 'v3', auth });
    // Search for forms in drive
    const response = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.form' and trashed = false",
      pageSize: 10,
      fields: 'files(id, name, webViewLink)',
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Forms API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize Gemini Client with standard User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Retry helper for handling transient Gemini API errors (like 503 UNAVAILABLE or 429 Rate Limit)
async function callGeminiWithRetry(fn: () => Promise<any>, retries = 3, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      console.warn(`Gemini call failed (attempt ${attempt}/${retries}):`, error.message || error);
      
      const isTransient = error.status === 503 || 
                          error.status === 429 || 
                          (error.message && (
                            error.message.includes('503') || 
                            error.message.includes('429') || 
                            error.message.includes('high demand') ||
                            error.message.includes('UNAVAILABLE') ||
                            error.message.includes('Resource temporarily unavailable')
                          ));
      
      if (!isTransient || attempt === retries) {
        throw error;
      }
      
      // Wait with backoff before next attempt
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

// Fisi Maji AI / Lupanulla AI endpoint (compatible with client request to /api/claude.php)
app.post('/api/claude.php', async (req, res) => {
  try {
    const { system, messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid messages array' });
      return;
    }

    // Map roles: 'assistant' -> 'model', 'user' -> 'user'
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Call Gemini API using modern SDK with built-in retry logic
    // Using gemini-3.5-flash as recommended by latest guidelines
    const interaction = await callGeminiWithRetry(() => ai.interactions.create({
      model: 'gemini-3.5-flash',
      input: contents.length > 0 ? contents[contents.length - 1].parts[0].text : 'Habari',
      // If we want to support multi-turn history with Interactions API, we'd need to manage session IDs.
      // For now, we'll use the simplified single-turn interaction pattern as shown in skill.
      system_instruction: system || 'Wewe ni msaidizi wa masomo Tanzania unayeitwa Fisi Maji AI. Unawasaidia wanafunzi wa Lupanulla kufaulu mitihani yao kwa kutoa notisi, maelezo, na majibu ya maswali ya kitaaluma.',
      generation_config: {
        temperature: 0.7,
      }
    }));

    // Extract text output from Interaction Response
    let fullOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    const reply = fullOutput || 'Samahani, sikuweza kupata jibu sahihi wakati huu.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const isHighDemand = error.status === 503 || (error.message && (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('UNAVAILABLE')));
    const friendlyMessage = isHighDemand
      ? 'Fisi Maji AI kwa sasa anakabiliwa na idadi kubwa sana ya wanafunzi wanaojifunza. Tafadhali subiri kidogo kisha ujaribu tena hivi punde (sekunde chache).'
      : (error.message || String(error));
    res.status(isHighDemand ? 503 : 500).json({ 
      error: 'Failed to process AI request', 
      message: friendlyMessage 
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { system, messages } = req.body;
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const interaction = await callGeminiWithRetry(() => ai.interactions.create({
      model: 'gemini-3.5-flash',
      input: contents.length > 0 ? contents[contents.length - 1].parts[0].text : 'Habari',
      system_instruction: system,
    }));

    let fullOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    res.json({ reply: fullOutput });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const isHighDemand = error.status === 503 || (error.message && (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('UNAVAILABLE')));
    const friendlyMessage = isHighDemand
      ? 'Mfumo wa AI kwa sasa una shughuli nyingi sana. Tafadhali subiri kidogo kisha ubonyeze tena.'
      : (error.message || String(error));
    res.status(isHighDemand ? 503 : 500).json({ 
      error: 'Failed to process AI request',
      message: friendlyMessage 
    });
  }
});

// Setup Vite or static serving based on environment
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting server in DEVELOPMENT mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting server in PRODUCTION mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
