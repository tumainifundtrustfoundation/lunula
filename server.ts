import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to fetch the system integrations SMTP configuration from Firestore via ADC
async function getSystemConfig(): Promise<any> {
  try {
    const authHelper = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const accessToken = await authHelper.getAccessToken();
    const projectId = "gen-lang-client-0775792411";
    
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/system_configs/integrations`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.warn(`Firestore REST API returned non-ok status: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    const fields = data.fields || {};
    const config: any = {};
    for (const key of Object.keys(fields)) {
      const valObj = fields[key];
      if ('stringValue' in valObj) {
        config[key] = valObj.stringValue;
      } else if ('integerValue' in valObj) {
        config[key] = parseInt(valObj.integerValue);
      } else if ('booleanValue' in valObj) {
        config[key] = valObj.booleanValue;
      }
    }
    return config;
  } catch (error) {
    console.error('Error fetching system config via Service Account:', error);
    return null;
  }
}

app.post('/api/auth/send-otp', async (req, res) => {
  const { email, code, name } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Missing email or code' });
  }

  console.log(`[AUTH OTP] Code for ${email}: ${code}`);

  try {
    const config = await getSystemConfig();
    const host = config?.emailSmtpHost || process.env.EMAIL_SMTP_HOST;
    const port = parseInt(config?.emailSmtpPort || process.env.EMAIL_SMTP_PORT || '587');
    const user = config?.emailSmtpUser || process.env.EMAIL_SMTP_USER;
    const pass = config?.emailSmtpPass || process.env.EMAIL_SMTP_PASS;
    const from = config?.emailSmtpUser || 'no-reply@lupanulla.co.tz';

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      const mailOptions = {
        from: `"Lupanulla Elimu Hub" <${from}>`,
        to: email,
        subject: `Uthibitisho wa Barua Pepe - Lupanulla Elimu Hub [${code}]`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0; text-transform: uppercase; font-size: 20px; letter-spacing: 1px;">Lupanulla Elimu Hub</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Ukurasa Namba Moja wa Elimu Tanzania</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; color: #334155;">
              <p style="font-size: 15px; margin: 0 0 16px 0;">Habari <strong>${name || 'Mtumiaji'}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Asante kwa kujiandikisha na Lupanulla Elimu Hub. Ili kukamilisha usajili wa akaunti yako na kuanza kupata notisi, vitabu, mitihani na huduma zote, tafadhali tumia nambari ya siri ya uthibitisho (OTP) iliyo hapa chini:
              </p>
              <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7;">${code}</span>
              </div>
              <p style="font-size: 13px; color: #64748b; margin: 0 0 24px 0;">
                Nambari hii ya siri itatumika mara moja tu. Tafadhali usimshirikishe mtu yeyote nambari hii kwa usalama wa akaunti yako.
              </p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0;">&copy; 2026 Lupanulla Elimu Hub. Haki zote zimehifadhiwa.</p>
              <p style="margin: 0;">Msaada: <a href="mailto:lupanulla.co.tz@hotmail.com" style="color: #0284c7; text-decoration: none;">lupanulla.co.tz@hotmail.com</a></p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[AUTH OTP] Email successfully sent to ${email}`);
      return res.json({ success: true, method: 'smtp' });
    } else {
      console.warn(`[AUTH OTP] SMTP is not configured in Firestore/Env. Printing code: ${code}`);
      return res.json({ 
        success: true, 
        method: 'simulation',
        message: 'SMTP haijasanidiwa. Tumia nambari hii inayojionyesha kwa majaribio.',
        code: code 
      });
    }
  } catch (err: any) {
    console.error('[AUTH OTP] Error sending email:', err);
    return res.json({ 
      success: true, 
      method: 'fallback_logs', 
      message: 'Imeshindwa kutuma barua pepe kupitia SMTP, lakini siri imeandikwa kwenye kumbukumbu za mfumo au hapa chini kwa majaribio.',
      code: code
    });
  }
});

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

app.get('/api/workspace/assignments', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  try {
    const classroom = google.classroom({ version: 'v1', auth });
    
    // 1. Get courses first
    const coursesRes = await classroom.courses.list({ courseStates: ['ACTIVE'] });
    const courses = coursesRes.data.courses || [];
    
    if (courses.length === 0) return res.json({ assignments: [] });

    // 2. Fetch coursework for each course in parallel
    const assignmentsPromises = courses.map(async (course) => {
      try {
        const cwRes = await classroom.courses.courseWork.list({ 
          courseId: course.id!,
          pageSize: 5 // Limit to 5 per course to avoid huge responses
        });
        const coursework = cwRes.data.courseWork || [];
        return coursework.map(cw => ({
          ...cw,
          courseName: course.name
        }));
      } catch (e) {
        console.warn(`Could not fetch assignments for course ${course.id}:`, e);
        return [];
      }
    });

    const allAssignmentsResults = await Promise.all(assignmentsPromises);
    const allAssignments = allAssignmentsResults.flat();
    
    res.json({ assignments: allAssignments });
  } catch (error: any) {
    console.error('Assignments API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── GMAIL ENDPOINTS ──

app.get('/api/workspace/emails', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  try {
    const gmail = google.gmail({ version: 'v1', auth });
    // List last 10 messages from the primary category/inbox
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return res.json({ emails: [] });
    }

    // Fetch details for each email in parallel
    const emailDetailsPromises = messages.map(async (msg) => {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!
        });

        const headers = detail.data.payload?.headers || [];
        const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown';
        const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          subject,
          from,
          date,
          snippet: detail.data.snippet || '',
          labelIds: detail.data.labelIds || []
        };
      } catch (err) {
        console.warn(`Error fetching email details for msg ${msg.id}:`, err);
        return null;
      }
    });

    const emailDetails = (await Promise.all(emailDetailsPromises)).filter(Boolean);
    res.json({ emails: emailDetails });
  } catch (error: any) {
    console.error('Gmail API list Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspace/emails/send', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth });

    // Construct MIME message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedEmail = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendRes = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    res.json({ success: true, messageId: sendRes.data.id });
  } catch (error: any) {
    console.error('Gmail API send Error:', error);
    res.status(500).json({ error: error.message });
  }
});


// ── GOOGLE DOCS ENDPOINTS ──

app.get('/api/workspace/docs', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  try {
    const drive = google.drive({ version: 'v3', auth });
    // List Google Docs only
    const response = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.document' and trashed = false",
      pageSize: 12,
      fields: 'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime, thumbnailLink)',
      orderBy: 'modifiedTime desc'
    });
    res.json({ docs: response.data.files || [] });
  } catch (error: any) {
    console.error('Docs API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspace/docs/create', async (req, res) => {
  const auth = getOAuth2Client(req);
  if (!auth) return res.status(401).json({ error: 'OAuth token missing' });

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing document name' });
  }

  try {
    const drive = google.drive({ version: 'v3', auth });
    // Create new document file
    const fileRes = await drive.files.create({
      requestBody: {
        name: name,
        mimeType: 'application/vnd.google-apps.document'
      },
      fields: 'id, name, webViewLink'
    });

    res.json({ success: true, file: fileRes.data });
  } catch (error: any) {
    console.error('Docs Create API Error:', error);
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
