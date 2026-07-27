const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'animegl-pastel-secret-key-2026';
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Load / Initialize file-based JSON Database
function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading database, resetting...', e);
  }
  const defaultDb = { users: [], favorites: {}, history: {}, ratings: {} };
  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

// ═══ AUTHENTICATION MIDDLEWARE ═══
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ═══ AUTH ROUTES ═══

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const db = loadDb();
  
  const userExists = db.users.some(
    u => u.email.toLowerCase() === email.toLowerCase() || 
         u.username.toLowerCase() === username.toLowerCase()
  );

  if (userExists) {
    return res.status(400).json({ error: 'Username or Email already registered' });
  }

  const newUser = {
    id: 'u_' + Date.now().toString(36),
    username,
    email,
    password, // Plain text for simplicity, in production hash this
    avatar: username[0].toUpperCase()
  };

  db.users.push(newUser);
  // Initialize user arrays in db tables
  db.favorites[newUser.id] = [];
  db.history[newUser.id] = [];
  db.ratings[newUser.id] = {};
  
  saveDb(db);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, avatar: newUser.avatar } });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDb();
  const user = db.users.find(
    u => (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) && 
         u.password === password
  );

  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar } });
});

// Get profile (verify session)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = loadDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({ user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar } });
});

// ═══ DATABASE SYNC ROUTES (USER PROFILE STATES) ═══

// Sync favorites list
app.post('/api/user/favorites', authenticateToken, (req, res) => {
  const { favorites } = req.body;
  if (!Array.isArray(favorites)) return res.status(400).json({ error: 'Favorites list must be an array' });

  const db = loadDb();
  db.favorites[req.user.id] = favorites;
  saveDb(db);
  
  res.json({ success: true, favorites });
});

app.get('/api/user/favorites', authenticateToken, (req, res) => {
  const db = loadDb();
  const favorites = db.favorites[req.user.id] || [];
  res.json({ favorites });
});

// Sync history list
app.post('/api/user/history', authenticateToken, (req, res) => {
  const { history } = req.body;
  if (!Array.isArray(history)) return res.status(400).json({ error: 'History list must be an array' });

  const db = loadDb();
  db.history[req.user.id] = history;
  saveDb(db);
  
  res.json({ success: true, history });
});

app.get('/api/user/history', authenticateToken, (req, res) => {
  const db = loadDb();
  const history = db.history[req.user.id] || [];
  res.json({ history });
});

// Sync ratings map
app.post('/api/user/ratings', authenticateToken, (req, res) => {
  const { ratings } = req.body;
  if (typeof ratings !== 'object') return res.status(400).json({ error: 'Ratings must be an object' });

  const db = loadDb();
  db.ratings[req.user.id] = ratings;
  saveDb(db);
  
  res.json({ success: true, ratings });
});

app.get('/api/user/ratings', authenticateToken, (req, res) => {
  const db = loadDb();
  const ratings = db.ratings[req.user.id] || {};
  res.json({ ratings });
});

// Serve compiled static React frontend from dist directory
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start backend
app.listen(PORT, () => {
  console.log(`🚀 Database Express server running at http://localhost:${PORT}`);
});
