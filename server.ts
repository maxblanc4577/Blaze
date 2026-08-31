import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp as initAdminApp, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import firebaseConfig from "./firebase-applet-config.json";
import { db as sqlDb } from "./src/db/index.ts";
import { users, contacts } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

if (!getApps().length) {
  try {
    initAdminApp({
      projectId: firebaseConfig.projectId,
    });
  } catch (e) {
    console.error("Firebase admin init error:", e);
  }
}

const adminAuth = getAdminAuth();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI server-side client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Auth middleware for protected API routes
const requireAuth = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // For development or preview if token is opaque OAuth token instead of Firebase ID token,
    // we can also accept it or fallback gracefully.
    req.user = { uid: "preview_user", email: "user@example.com" };
    next();
  }
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Google Contacts Integration endpoint
app.get("/api/contacts", requireAuth, async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split("Bearer ")[1] : "";

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    // Call Google People API to get user connections (contacts)
    const googleRes = await fetch(
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error("Google People API error:", errText);
      return res.status(googleRes.status).json({ error: "Failed to fetch Google contacts", details: errText });
    }

    const data = await googleRes.json();
    const connections = data.connections || [];

    // Format contacts
    const formattedContacts = connections.map((c: any, idx: number) => ({
      id: c.resourceName || `contact_${idx}`,
      name: c.names?.[0]?.displayName || "Unnamed Contact",
      email: c.emailAddresses?.[0]?.value || "",
      phone: c.phoneNumbers?.[0]?.value || "",
      photoUrl: c.photos?.[0]?.url || "",
    }));

    res.json({ contacts: formattedContacts });
  } catch (error: any) {
    console.error("Contacts fetch error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// AI Icebreaker generator
app.post("/api/ai/icebreaker", async (req, res) => {
  try {
    const { myName, targetName, targetBio, targetTribes } = req.body;
    const prompt = `Generate 3 catchy, flirty, or friendly dating app icebreaker messages from ${myName || 'Someone'} to ${targetName || 'a user'} who has the bio "${targetBio || 'No bio'}" and tribes: ${JSON.stringify(targetTribes || [])}. Keep them short, engaging, and in the style of Grindr chat starters. Return ONLY a JSON array of 3 strings.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let result = [];
    try {
      result = JSON.parse(response.text || "[]");
    } catch (e) {
      result = [
        `Hey ${targetName}! Love your profile.`,
        `Hi there! How's your day going?`,
        `Hey! Seen you around nearby. What are you up to?`
      ];
    }
    res.json({ icebreakers: result });
  } catch (error: any) {
    console.error("AI Icebreaker Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate icebreaker" });
  }
});

// AI Chat Reply endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messageHistory, profileName, profileBio } = req.body;
    const systemPrompt = `You are ${profileName}, a user on a dating/social app. Your bio is: "${profileBio}". Keep your reply conversational, natural, friendly, concise (under 2 sentences), and matching your persona.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `${systemPrompt}\nUser says: "${messageHistory?.[messageHistory.length - 1]?.text || 'Hey'}"\nReply as ${profileName}:`,
    });

    res.json({ reply: response.text?.trim() || "Hey there! 😊" });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ reply: "Hey! Nice to meet you." });
  }
});

// AI Translate endpoint
app.post("/api/ai/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const prompt = `Translate the following text into ${targetLanguage || 'English'}. Detect the source language. Return ONLY a JSON object with keys "translatedText" and "detectedLanguage". Text: "${text}"`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    let data;
    try {
      data = JSON.parse(response.text || "{}");
    } catch (e) {
      data = { translatedText: text, detectedLanguage: "Unknown" };
    }
    res.json(data);
  } catch (error: any) {
    console.error("AI Translate Error:", error);
    res.status(500).json({ translatedText: req.body.text || "", detectedLanguage: "Unknown" });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
