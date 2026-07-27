import net from 'net';

// Discord Application Client ID for AnimeGL (or default Rich Presence ID)
const CLIENT_ID = '1210298374981923840'; 

let pipe = null;
let currentActivity = null;

function getPipePath(id = 0) {
  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\discord-ipc-${id}`;
  }
  const env = process.env;
  const prefix = env.XDG_RUNTIME_DIR || env.TMPDIR || env.TMP || env.TEMP || '/tmp';
  return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
}

function encodeFrame(op, data) {
  const payload = JSON.stringify(data);
  const len = Buffer.byteLength(payload);
  const buf = Buffer.alloc(8 + len);
  buf.writeInt32LE(op, 0);
  buf.writeInt32LE(len, 4);
  buf.write(payload, 8, len, 'utf8');
  return buf;
}

export function connectDiscordRPC() {
  return new Promise((resolve, reject) => {
    const pipePath = getPipePath(0);
    pipe = net.createConnection(pipePath, () => {
      // Send Handshake (OPCODE 0)
      const handshake = encodeFrame(0, { v: 1, client_id: CLIENT_ID });
      pipe.write(handshake);
      console.log('Connected to Discord Desktop IPC!');
      resolve(pipe);
    });

    pipe.on('error', (err) => {
      console.log('Discord Desktop IPC connection error:', err.message);
      pipe = null;
    });

    pipe.on('data', (chunk) => {
      // Handle response packets
    });
  });
}

export function setDiscordActivity(activity) {
  if (!pipe) return;
  const frame = encodeFrame(1, {
    cmd: 'SET_ACTIVITY',
    args: {
      pid: process.pid,
      activity: {
        details: activity.details || 'Explorando AnimeGL',
        state: activity.state || 'Catálogo de Anime',
        timestamps: activity.startTimestamp ? { start: activity.startTimestamp } : undefined,
        assets: {
          large_image: activity.largeImage || 'animegl_logo',
          large_text: 'AnimeGL 3.0 Cinema',
          small_image: 'play_icon',
          small_text: 'Viendo Anime'
        },
        buttons: [
          { label: 'Ver Episodio', url: activity.url || 'http://localhost:5174/' },
          { label: 'Abrir Catálogo', url: 'http://localhost:5174/' }
        ]
      }
    },
    nonce: Date.now().toString()
  });
  pipe.write(frame);
}

// HTTP Bridge server for browser communication
import http from 'http';

const bridgeServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        setDiscordActivity(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = 3001;
bridgeServer.listen(PORT, async () => {
  console.log(`AnimeGL Discord Bridge listening on http://localhost:${PORT}`);
  try {
    await connectDiscordRPC();
    setDiscordActivity({
      details: 'Viendo AnimeGL 3.0',
      state: 'Explorando catálogo',
      startTimestamp: Math.floor(Date.now() / 1000)
    });
  } catch (e) {
    console.log('Discord RPC client not running currently.');
  }
});
