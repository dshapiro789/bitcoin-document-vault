const config = {
  port: process.env.PORT || 3001,
  sessionSecret: process.env.SESSION_SECRET,
  frontendUrl: process.env.NODE_ENV === 'production'
    ? 'https://bitcoin-document-vault-tan.vercel.app'
    : 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI,
  defaultNodeUrl: process.env.DEFAULT_NODE_URL,
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  }
};

export default config; 