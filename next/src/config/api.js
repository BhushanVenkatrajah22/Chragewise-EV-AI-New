import axios from 'axios';

// Determine Node API URL: prioritize environment variable, strip trailing slashes, fallback to localhost for dev
const rawNodeUrl = process.env.NEXT_PUBLIC_NODE_URL;
export const NODE_API_URL = (rawNodeUrl && rawNodeUrl.trim() !== '')
  ? rawNodeUrl.replace(/\/+$/, '')
  : 'http://localhost:5000';

// Determine AI API URL
const rawAiUrl = process.env.NEXT_PUBLIC_AI_URL;
export const AI_API_URL = (rawAiUrl && rawAiUrl.trim() !== '')
  ? rawAiUrl.replace(/\/+$/, '')
  : 'http://localhost:8000';

