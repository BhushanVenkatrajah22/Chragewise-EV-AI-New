import axios from 'axios';

// Bypass localtunnel warning/reminder pages automatically for all Axios requests
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';
axios.defaults.headers.common['localtunnel-skip-warning'] = 'true';

export const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_URL || 'https://beige-ghosts-scream.loca.lt';
export const AI_API_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
