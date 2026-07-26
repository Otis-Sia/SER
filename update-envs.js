const fs = require('fs');
const path = require('path');

const credsPath = path.join(__dirname, 'credentials.json');
const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
const credsStr = JSON.stringify(creds);

// Update client/.env.local
const clientEnvPath = path.join(__dirname, 'client', '.env.local');
let clientEnv = fs.existsSync(clientEnvPath) ? fs.readFileSync(clientEnvPath, 'utf8') : '';
clientEnv = clientEnv.replace(/NEXT_PUBLIC_API_URL=.*/, 'NEXT_PUBLIC_API_URL=https://ser-hfsz.onrender.com');
if (!clientEnv.includes('FIREBASE_SERVICE_ACCOUNT_JSON')) {
  clientEnv += `\nFIREBASE_SERVICE_ACCOUNT_JSON='${credsStr}'\n`;
}
fs.writeFileSync(clientEnvPath, clientEnv);

// Update server/.env
const serverEnvPath = path.join(__dirname, 'server', '.env');
let serverEnv = fs.existsSync(serverEnvPath) ? fs.readFileSync(serverEnvPath, 'utf8') : '';
serverEnv = serverEnv.replace(/CORS_ORIGIN=.*/, 'CORS_ORIGIN=https://ser-amber.vercel.app');
if (!serverEnv.includes('FIREBASE_SERVICE_ACCOUNT_JSON')) {
  serverEnv += `\nFIREBASE_SERVICE_ACCOUNT_JSON='${credsStr}'\n`;
}
if (!serverEnv.includes('GOOGLE_CREDENTIALS')) {
  serverEnv += `\nGOOGLE_CREDENTIALS='${credsStr}'\n`;
}
fs.writeFileSync(serverEnvPath, serverEnv);

console.log("Environment variables updated successfully!");
