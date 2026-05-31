import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';

// Simulated database of location and threat profiles for live stream
const countries = [
  { flag: "🇫🇮", nameEn: "Finland • VPN", nameFa: "فنلاند • وی‌پی‌ان" },
  { flag: "🇺🇸", nameEn: "United States", nameFa: "ایالات متحده" },
  { flag: "🇳🇱", nameEn: "Netherlands • TOR", nameFa: "هلند • تور" },
  { flag: "🇩🇪", nameEn: "Germany", nameFa: "آلمان" },
  { flag: "🇨🇳", nameEn: "China • Botnet Node", nameFa: "چین • گره بات‌نت" },
  { flag: "🇬🇧", nameEn: "United Kingdom", nameFa: "بریتانیا" },
  { flag: "🇷🇺", nameEn: "Russia", nameFa: "روسیه" },
  { flag: "🇸🇬", nameEn: "Singapore", nameFa: "سنگاپور" },
  { flag: "🇯🇵", nameEn: "Japan", nameFa: "ژاپن" },
  { flag: "🇫🇷", nameEn: "France • Anonymous Proxy", nameFa: "فرانسه • پروکسی ناشناس" },
];

const threatTypes = [
  { typeEn: "Malicious Activity", typeFa: "فعالیت مخرب فایروال", color: "rose", minScore: 85 },
  { typeEn: "Suspicious IP", typeFa: "آی‌پی مشکوک", color: "amber", minScore: 60 },
  { typeEn: "Tor Exit Node", typeFa: "نود خروجی Tor", color: "rose", minScore: 90 },
  { typeEn: "Low Reputation", typeFa: "حسن سابقه ضعیف", color: "emerald", minScore: 20 },
  { typeEn: "VPN Detected", typeFa: "شناسایی وی‌پی‌ان", color: "amber", minScore: 50 },
  { typeEn: "DDoS Attempt", typeFa: "تلاش برای حمله DDoS", color: "rose", minScore: 95 },
  { typeEn: "Credential Stuffing", typeFa: "تلاش برای حدس کلمه عبور", color: "amber", minScore: 75 },
];

function generateRandomIp() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'passport-platform' });
  });

  app.get('/api/telemetry/events', (req, res) => {
    const events = Array.from({ length: 15 }).map((_, i) => ({
      id: `evt_${Date.now()}_${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      type: ['FAILED_LOGIN', 'DEVICE_DETECTED', 'RISK_UPDATED', 'THREAT_DETECTED'][Math.floor(Math.random() * 4)],
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
      sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      status: 'PROCESSED'
    }));
    res.json(events);
  });

  app.get('/api/intelligence/network', (req, res) => {
    res.json({
      activeThreats: Math.floor(Math.random() * 50) + 10,
      globalRiskScore: (Math.random() * 20 + 70).toFixed(1), // 70-90
      monitoredSessions: Math.floor(Math.random() * 5000) + 1000,
      anomaliesDetected: Math.floor(Math.random() * 100)
    });
  });

  app.get('/api/risk/trend', (req, res) => {
    const data = Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      riskScore: 20 + Math.random() * 60 + (i === 14 ? 30 : 0), // Spike at 14:00
      baseline: 30
    }));
    res.json(data);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Attach WebSocket Server
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to Live Threat Feed WS stream');

    // Create a initial state payload
    const initialEvents = Array.from({ length: 5 }).map((_, i) => {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      const riskScore = Math.floor(threat.minScore + Math.random() * (100 - threat.minScore));
      
      return {
        id: `evt_init_${Date.now() - i * 12000}_${Math.random().toString(36).substring(2, 7)}`,
        flag: country.flag,
        ip: generateRandomIp(),
        clocEn: country.nameEn,
        clocFa: country.nameFa,
        timestamp: new Date(Date.now() - i * 12000).toISOString(),
        rScore: riskScore,
        typeEn: threat.typeEn,
        typeFa: threat.typeFa,
        c: threat.color,
      };
    });

    ws.send(JSON.stringify({ type: 'INIT', data: initialEvents }));

    ws.on('close', () => {
      console.log('Client disconnected from Live Threat Feed WS stream');
    });
  });

  // Broadcast new events periodically
  setInterval(() => {
    if (wss.clients.size === 0) return;

    const country = countries[Math.floor(Math.random() * countries.length)];
    const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const riskScore = Math.floor(threat.minScore + Math.random() * (100 - threat.minScore));

    const event = {
      id: `evt_stream_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      flag: country.flag,
      ip: generateRandomIp(),
      clocEn: country.nameEn,
      clocFa: country.nameFa,
      timestamp: new Date().toISOString(),
      rScore: riskScore,
      typeEn: threat.typeEn,
      typeFa: threat.typeFa,
      c: threat.color,
    };

    const message = JSON.stringify({ type: 'EVENT', data: event });
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }, 4000);
}

startServer();
