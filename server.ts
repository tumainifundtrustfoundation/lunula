import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
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
    const { system, messages, modelChoice, thinking, grounding } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid messages array' });
      return;
    }

    // Check if API Key is missing or default placeholder before attempting call
    const key = process.env.GEMINI_API_KEY;
    const isApiKeyMissing = !key || key === 'MY_GEMINI_API_KEY' || key.trim() === '';
    
    if (isApiKeyMissing) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Samahani! Ufunguo wa Gemini AI (`GEMINI_API_KEY`) haujasanidiwa kwenye mfumo. Tafadhali nenda kwenye jopo la **Settings > Secrets** (upande wa juu kulia wa AI Studio) na uongeze siri mpya inayoitwa **GEMINI_API_KEY** kisha uweke ufunguo wako halali wa Gemini API ili kuwezesha huduma hii ya AI.'
      });
    }

    // Map roles & build multimodal/parts structure
    const contents = messages.map((m: any, idx: number) => {
      const isLast = idx === messages.length - 1;
      const role = m.role === 'assistant' ? 'model' : 'user';
      
      // If there are attachments, map them as standard GenAI parts
      if (m.attachments && m.attachments.length > 0) {
        const parts: any[] = [];
        
        m.attachments.forEach((att: any) => {
          if (att.mimeType && att.base64Data) {
            let cleanBase64 = att.base64Data;
            if (cleanBase64.includes(';base64,')) {
              cleanBase64 = cleanBase64.split(';base64,')[1];
            }
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: cleanBase64
              }
            });
          }
        });
        
        if (m.content) {
          parts.push({ text: m.content });
        } else {
          parts.push({ text: "Chambua faili hili la media." });
        }
        
        return { role, parts };
      }
      
      return { role, parts: [{ text: m.content || "" }] };
    });

    // Model selection based on features and user preference
    // Default to gemini-3.1-flash-lite for working quota and fast response
    let selectedModel = 'gemini-3.1-flash-lite';
    if (thinking) {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (modelChoice === 'pro') {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (modelChoice === 'lite') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (modelChoice === 'flash') {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    const config: any = {
      systemInstruction: system || 'Wewe ni msaidizi wa masomo Tanzania unayeitwa Fisi Maji AI. Unawasaidia wanafunzi wa Lupanulla kufaulu mitihani yao kwa kutoa notisi, maelezo, na majibu ya maswali ya kitaaluma.',
      temperature: 0.7,
    };

    // Set thinking level to HIGH on gemini-3.1-pro-preview if thinking is enabled
    if (thinking && selectedModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingBudget: 2048,
        thinkingLevel: "HIGH"
      };
      // Do not set maxOutputTokens
    }

    // Set search or maps grounding if selected
    if (grounding === 'search') {
      config.tools = [{ googleSearch: {} }];
    } else if (grounding === 'maps') {
      config.tools = [{ googleMaps: {} }];
    }

    // Call Gemini API with automatic fallback to gemini-3.1-flash-lite
    let response;
    try {
      response = await callGeminiWithRetry(() => ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: config
      }));
    } catch (primaryError: any) {
      console.warn(`Primary model ${selectedModel} failed. Falling back to gemini-3.1-flash-lite... Error:`, primaryError.message || primaryError);
      if (selectedModel !== 'gemini-3.1-flash-lite') {
        const fallbackConfig = { ...config };
        delete fallbackConfig.thinkingConfig;
        if (fallbackConfig.tools) {
          // gemini-3.1-flash-lite doesn't support search/maps tools under some free-tier quotas, remove if fallback
          delete fallbackConfig.tools;
        }
        response = await callGeminiWithRetry(() => ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: contents,
          config: fallbackConfig
        }));
      } else {
        throw primaryError;
      }
    }

    const reply = response.text || 'Samahani, sikuweza kupata jibu sahihi wakati huu.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errStr = String(error.message || error);
    const isHighDemand = error.status === 503 || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE');
    
    const isAuthError = 
      error.status === 401 ||
      error.status === 403 ||
      error.status === 400 ||
      errStr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
      errStr.includes('UNAUTHENTICATED') ||
      errStr.includes('API_KEY_INVALID') ||
      errStr.includes('API key') ||
      errStr.includes('credentials') ||
      errStr.includes('PERMISSION_DENIED');

    let friendlyMessage = '';
    if (isAuthError) {
      friendlyMessage = 'Samahani! Ufunguo wa Gemini AI (`GEMINI_API_KEY`) haujasanidiwa vizuri au hauko sahihi. Tafadhali nenda kwenye jopo la **Settings > Secrets** (upande wa juu kulia wa AI Studio) na uhakikishe siri ya **GEMINI_API_KEY** ina ufunguo wako halali wa Gemini API.';
    } else if (isHighDemand) {
      friendlyMessage = 'Fisi Maji AI kwa sasa anakabiliwa na idadi kubwa sana ya wanafunzi wanaojifunza. Tafadhali subiri kidogo kisha ujaribu tena hivi punde (sekunde chache).';
    } else {
      friendlyMessage = errStr;
    }

    res.status(isAuthError ? 401 : (isHighDemand ? 503 : 500)).json({ 
      error: 'Failed to process AI request', 
      message: friendlyMessage 
    });
  }
});

// Audio transcription endpoint (using gemini-3.5-flash)
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Missing audio base64Data' });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      return res.status(401).json({ error: 'API key not configured' });
    }

    let cleanBase64 = base64Data;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: cleanBase64
          }
        },
        'Katika Kiswahili au Kiingereza (kulingana na lugha iliyotumika), andika maneno yanayosemwa kwenye rekodi hii ya sauti kwa usahihi wa hali ya juu bila kuongeza maelezo au maoni yoyote ya ziada. Ikiwa sauti haieleweki kabisa au haina maneno, andika tu "(Sauti haieleweki)".'
      ]
    }));

    res.json({ text: (response.text || '').trim() });
  } catch (error: any) {
    console.error('Transcription API Error:', error);
    res.status(500).json({ error: error.message || 'Shida ilitokea wakati wa kunakili sauti.' });
  }
});

// Image Generation and Aspect Ratio endpoint (using gemini-3.1-flash-image-preview or gemini-3-pro-image-preview)
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio, quality } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      return res.status(401).json({ error: 'API key not configured' });
    }

    // gemini-3.1-flash-image-preview for general, gemini-3-pro-image-preview for studio quality
    const selectedModel = quality === 'studio' ? 'gemini-3-pro-image-preview' : 'gemini-3.1-flash-image-preview';

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
          imageSize: '1K'
        }
      }
    }));

    let base64Data = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (!base64Data) {
      throw new Error('No image was returned by the generation model.');
    }

    const imageUrl = `data:image/png;base64,${base64Data}`;
    res.json({ imageUrl });
  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    res.status(500).json({ error: error.message || 'Shida ilitokea wakati wa kutengeneza picha.' });
  }
});

// AI News Crawler with Search Grounding to aggregate Tanzanian educational updates
app.post('/api/ai/crawl-news', async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      return res.status(401).json({ error: 'API key not configured' });
    }

    // Use gemini-3.1-flash-lite as the base model for reliability
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Tafuta habari mpya, za kuaminika na za hivi karibuni (ndani ya miezi michache iliyopita) zinazohusu sekta ya elimu Tanzania, ratiba au matangazo ya NECTA (Baraza la Mitihani la Tanzania), mtaala mpya wa TIE (Taasisi ya Elimu Tanzania), bodi ya mikopo HESLB, au habari zozote za kielimu zinazohusu Lupanulla Hub. Lengo letu ni kukusanya habari hizi na kuziweka hadharani kwa wanafunzi na walimu kwenye Lupanulla Elimu Hub. Tafadhali andika habari hizi zote kwa lugha ya Kiswahili fasaha na yenye kuvutia sana.',
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Orodha ya habari za hivi karibuni za elimu nchini Tanzania",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { 
                type: Type.STRING, 
                description: "Kichwa cha habari kirefu na rasmi (kwa Kiswahili)." 
              },
              source: { 
                type: Type.STRING, 
                description: "Chanzo cha habari hii, mfano: Baraza la Mitihani (NECTA), Taasisi ya Elimu (TIE), Bodi ya Mikopo (HESLB), au Lupanulla Media." 
              },
              content: { 
                type: Type.STRING, 
                description: "Muhtasari wa habari wa aya mbili hadi tatu kwa Kiswahili ukiwa na maelezo kamili ya kutosha." 
              },
              url: { 
                type: Type.STRING, 
                description: "URL halisi ya habari hiyo iliyopatikana kwenye Google Search au tovuti husika kama necta.go.tz." 
              },
              relevanceExplanation: { 
                type: Type.STRING, 
                description: "Maelezo mafupi kwanini habari hii ni muhimu kwa watumiaji na wanafunzi wanaosoma Lupanulla Hub." 
              }
            },
            required: ["title", "source", "content", "relevanceExplanation"]
          }
        }
      }
    }));

    const text = response.text || '[]';
    let newsItems = [];
    try {
      newsItems = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse Gemini news JSON:', text);
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        newsItems = JSON.parse(match[0]);
      }
    }

    res.json({ news: newsItems });
  } catch (error: any) {
    console.error('Crawl News API Error:', error);
    res.status(500).json({ error: error.message || 'Shida ilitokea wakati wa kukusanya habari.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { system, messages } = req.body;

    // Check if API Key is missing or default placeholder before attempting call
    const key = process.env.GEMINI_API_KEY;
    const isApiKeyMissing = !key || key === 'MY_GEMINI_API_KEY' || key.trim() === '';
    
    if (isApiKeyMissing) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Samahani! Ufunguo wa Gemini AI (`GEMINI_API_KEY`) haujasanidiwa kwenye mfumo. Tafadhali nenda kwenye jopo la **Settings > Secrets** (upande wa juu kulia wa AI Studio) na uongeze siri mpya inayoitwa **GEMINI_API_KEY** kisha uweke ufunguo wako halali wa Gemini API ili kuwezesha huduma hii ya AI.'
      });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
      config: {
        systemInstruction: system,
        temperature: 0.7,
      }
    }));

    res.json({ reply: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errStr = String(error.message || error);
    const isHighDemand = error.status === 503 || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE');
    
    const isAuthError = 
      error.status === 401 ||
      error.status === 403 ||
      error.status === 400 ||
      errStr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
      errStr.includes('UNAUTHENTICATED') ||
      errStr.includes('API_KEY_INVALID') ||
      errStr.includes('API key') ||
      errStr.includes('credentials') ||
      errStr.includes('PERMISSION_DENIED');

    let friendlyMessage = '';
    if (isAuthError) {
      friendlyMessage = 'Samahani! Ufunguo wa Gemini AI (`GEMINI_API_KEY`) haujasanidiwa vizuri au hauko sahihi. Tafadhali nenda kwenye jopo la **Settings > Secrets** (upande wa juu kulia wa AI Studio) na uhakikishe siri ya **GEMINI_API_KEY** ina ufunguo wako halali wa Gemini API.';
    } else if (isHighDemand) {
      friendlyMessage = 'Mfumo wa AI kwa sasa una shughuli nyingi sana. Tafadhali subiri kidogo kisha ubonyeze tena.';
    } else {
      friendlyMessage = errStr;
    }

    res.status(isAuthError ? 401 : (isHighDemand ? 503 : 500)).json({ 
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
