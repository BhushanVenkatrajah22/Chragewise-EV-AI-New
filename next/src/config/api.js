import axios from 'axios';

// Active Cloudflare Tunnel URL for your running Node backend
const CLOUDFLARE_TUNNEL_URL = 'https://disc-reaction-counseling-gathering.trycloudflare.com';

const envUrl = process.env.NEXT_PUBLIC_NODE_URL;
const isInvalidEnv = !envUrl || 
  envUrl.includes('localhost') || 
  envUrl.includes('loca.lt') || 
  envUrl.includes('your-node-backend-url') ||
  envUrl.includes('your-backend-url') ||
  envUrl.includes('onrender.com');

export const NODE_API_URL = isInvalidEnv ? CLOUDFLARE_TUNNEL_URL : envUrl;
export const AI_API_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
