import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'DEMO_KEY';

if (!apiKey || apiKey === 'AIzaSy...DEMO_KEY_REPLACE_WITH_REAL') {
  console.warn("⚠️ WARNING: Real GEMINI_API_KEY is not configured in backend/.env. AI service will operate using realistic simulated rule-based extraction mode.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey });
export const GEMINI_MODEL_PRO = 'gemini-2.5-pro';
export const GEMINI_MODEL_FLASH = 'gemini-2.5-flash';
