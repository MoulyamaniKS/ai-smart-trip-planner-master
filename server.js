/**
 * AI SMART TRIP PLANNER - FULL-STACK BACKEND SERVER
 * Zero-dependency native Node.js server with SQLite Database & REST APIs
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = path.join(__dirname, 'trips.db');

// --- DATABASE INITIALIZATION ---
let db = null;
let useJsonFallback = false;
let jsonDb = {
  users: [],
  trips: [],
  favorites: [],
  rental_bookings: [],
  guide_inquiries: [],
  reviews: []
};

const JSON_DB_PATH = path.join(__dirname, 'database.json');

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      destination TEXT NOT NULL,
      trip_name TEXT NOT NULL,
      start_date TEXT,
      days INTEGER DEFAULT 3,
      travelers INTEGER DEFAULT 2,
      budget_tier TEXT DEFAULT 'moderate',
      travel_style TEXT DEFAULT 'Culture & Sights',
      preferences TEXT,
      itinerary TEXT,
      total_budget REAL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      destination_id TEXT NOT NULL,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rental_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      vehicle_name TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      destination TEXT NOT NULL,
      rental_shop TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      pickup_date TEXT,
      duration_days INTEGER DEFAULT 1,
      total_price REAL DEFAULT 0,
      status TEXT DEFAULT 'Confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guide_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      guide_name TEXT NOT NULL,
      destination TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      tour_date TEXT,
      group_size INTEGER DEFAULT 2,
      selected_package TEXT,
      special_requests TEXT,
      status TEXT DEFAULT 'Confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_name TEXT NOT NULL,
      author_name TEXT NOT NULL,
      rating REAL DEFAULT 5,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default demo user if not exists
  const checkStmt = db.prepare("SELECT id FROM users WHERE email = ?");
  const existingUser = checkStmt.get("traveler@smarttrip.com");
  if (!existingUser) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync("password123", salt, 64).toString('hex');
    const insertStmt = db.prepare("INSERT INTO users (name, email, password_hash, salt, avatar) VALUES (?, ?, ?, ?, ?)");
    insertStmt.run(
      "Alex Traveler",
      "traveler@smarttrip.com",
      hash,
      salt,
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    );
  }
  console.log("✅ SQLite Database initialized successfully at " + DB_PATH);
} catch (err) {
  console.warn("⚠️ SQLite initialization warning, using persistent JSON file store:", err.message);
  useJsonFallback = true;
  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      jsonDb = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
    } catch (e) {
      console.error("Error reading JSON db:", e);
    }
  }
  // Ensure default demo user exists
  if (!jsonDb.users.some(u => u.email === "traveler@smarttrip.com")) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync("password123", salt, 64).toString('hex');
    jsonDb.users.push({
      id: 1,
      name: "Alex Traveler",
      email: "traveler@smarttrip.com",
      password_hash: hash,
      salt: salt,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      created_at: new Date().toISOString()
    });
    saveJsonDb();
  }
}

function saveJsonDb() {
  if (useJsonFallback) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jsonDb, null, 2), 'utf-8');
  }
}

// --- PASSWORD HASHING HELPER ---
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// --- REQUEST BODY PARSER ---
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// --- JSON RESPONSE HELPER ---
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// --- MIME TYPES ---
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// --- HTTP SERVER ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API ROUTING ---

  // Health Check
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'AI Smart Trip Planner API',
      database: useJsonFallback ? 'JSON Storage' : 'SQLite DatabaseSync',
      version: '1.0.0'
    });
  }

  // Auth: Register
  if (pathname === '/api/auth/register' && method === 'POST') {
    const data = await parseJsonBody(req);
    const name = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = (data.password || '').trim();

    if (!name || !email || !password) {
      return sendJson(res, 400, { status: 'error', message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return sendJson(res, 400, { status: 'error', message: 'Password must be at least 6 characters long' });
    }

    try {
      if (!useJsonFallback) {
        const checkStmt = db.prepare("SELECT id FROM users WHERE email = ?");
        if (checkStmt.get(email)) {
          return sendJson(res, 409, { status: 'error', message: 'An account with this email already exists' });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(password, salt);
        const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
        const insertStmt = db.prepare("INSERT INTO users (name, email, password_hash, salt, avatar) VALUES (?, ?, ?, ?, ?)");
        insertStmt.run(name, email, hash, salt, avatar);
        const user = db.prepare("SELECT id, name, email, avatar FROM users WHERE email = ?").get(email);
        return sendJson(res, 201, {
          status: 'success',
          message: `Welcome, ${name}! Your account has been created.`,
          user,
          token: `token_${user.id}_${Date.now()}`
        });
      } else {
        if (jsonDb.users.some(u => u.email === email)) {
          return sendJson(res, 409, { status: 'error', message: 'An account with this email already exists' });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(password, salt);
        const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
        const user = {
          id: jsonDb.users.length + 1,
          name,
          email,
          password_hash: hash,
          salt,
          avatar,
          created_at: new Date().toISOString()
        };
        jsonDb.users.push(user);
        saveJsonDb();
        return sendJson(res, 201, {
          status: 'success',
          message: `Welcome, ${name}! Your account has been created.`,
          user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
          token: `token_${user.id}_${Date.now()}`
        });
      }
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // Auth: Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const data = await parseJsonBody(req);
    const email = (data.email || '').trim().toLowerCase();
    const password = (data.password || '').trim();

    if (!email || !password) {
      return sendJson(res, 400, { status: 'error', message: 'Email and password are required' });
    }

    try {
      let user = null;
      if (!useJsonFallback) {
        user = db.prepare("SELECT id, name, email, password_hash, salt, avatar FROM users WHERE email = ?").get(email);
      } else {
        user = jsonDb.users.find(u => u.email === email);
      }

      if (!user) {
        return sendJson(res, 401, { status: 'error', message: 'Invalid email or password' });
      }

      const inputHash = hashPassword(password, user.salt);
      if (inputHash !== user.password_hash) {
        return sendJson(res, 401, { status: 'error', message: 'Invalid email or password' });
      }

      const userProfile = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
      return sendJson(res, 200, {
        status: 'success',
        message: `Welcome back, ${user.name}!`,
        user: userProfile,
        token: `token_${user.id}_${Date.now()}`
      });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // Auth: Google Demo Sign-in
  if (pathname === '/api/auth/google' && method === 'POST') {
    const data = await parseJsonBody(req);
    const email = (data.email || 'google.traveler@gmail.com').trim().toLowerCase();
    const name = data.name || 'Google Explorer';
    const avatar = data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

    try {
      let user = null;
      if (!useJsonFallback) {
        user = db.prepare("SELECT id, name, email, avatar FROM users WHERE email = ?").get(email);
        if (!user) {
          const salt = crypto.randomBytes(16).toString('hex');
          const hash = hashPassword('oauth_verified_pass', salt);
          db.prepare("INSERT INTO users (name, email, password_hash, salt, avatar) VALUES (?, ?, ?, ?, ?)").run(
            name, email, hash, salt, avatar
          );
          user = db.prepare("SELECT id, name, email, avatar FROM users WHERE email = ?").get(email);
        }
      } else {
        user = jsonDb.users.find(u => u.email === email);
        if (!user) {
          user = {
            id: jsonDb.users.length + 1,
            name,
            email,
            avatar,
            created_at: new Date().toISOString()
          };
          jsonDb.users.push(user);
          saveJsonDb();
        }
      }

      return sendJson(res, 200, {
        status: 'success',
        message: `Signed in with Google as ${name}`,
        user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
        token: `google_token_${user.id}_${Date.now()}`
      });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // Trips: GET All
  if (pathname === '/api/trips' && method === 'GET') {
    try {
      let trips = [];
      if (!useJsonFallback) {
        trips = db.prepare("SELECT * FROM trips ORDER BY updated_at DESC").all();
      } else {
        trips = [...jsonDb.trips].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
      }
      const parsedTrips = trips.map(t => ({
        ...t,
        preferences: typeof t.preferences === 'string' ? JSON.parse(t.preferences || '[]') : (t.preferences || []),
        itinerary: typeof t.itinerary === 'string' ? JSON.parse(t.itinerary || '[]') : (t.itinerary || [])
      }));
      return sendJson(res, 200, parsedTrips);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Trips: POST Create
  if (pathname === '/api/trips' && method === 'POST') {
    const data = await parseJsonBody(req);
    try {
      const destination = data.destination || 'Custom Destination';
      const trip_name = data.trip_name || `Trip to ${destination}`;
      const start_date = data.start_date || new Date().toISOString().split('T')[0];
      const days = parseInt(data.days) || 3;
      const travelers = parseInt(data.travelers) || 2;
      const budget_tier = data.budget_tier || 'moderate';
      const travel_style = data.travel_style || 'Culture & Sights';
      const preferences = JSON.stringify(data.preferences || []);
      const itinerary = JSON.stringify(data.itinerary || []);
      const total_budget = parseFloat(data.total_budget) || 0;
      const notes = data.notes || '';

      if (!useJsonFallback) {
        const stmt = db.prepare(`
          INSERT INTO trips (destination, trip_name, start_date, days, travelers, budget_tier, travel_style, preferences, itinerary, total_budget, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(destination, trip_name, start_date, days, travelers, budget_tier, travel_style, preferences, itinerary, total_budget, notes);
        return sendJson(res, 201, { status: 'saved', id: Number(result.lastInsertRowid), trip_name });
      } else {
        const newTrip = {
          id: jsonDb.trips.length + 1,
          destination,
          trip_name,
          start_date,
          days,
          travelers,
          budget_tier,
          travel_style,
          preferences: data.preferences || [],
          itinerary: data.itinerary || [],
          total_budget,
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        jsonDb.trips.push(newTrip);
        saveJsonDb();
        return sendJson(res, 201, { status: 'saved', id: newTrip.id, trip_name });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Trips: DELETE /api/trips/:id
  if (pathname.startsWith('/api/trips/') && method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop());
    try {
      if (!useJsonFallback) {
        db.prepare("DELETE FROM trips WHERE id = ?").run(id);
      } else {
        jsonDb.trips = jsonDb.trips.filter(t => t.id !== id);
        saveJsonDb();
      }
      return sendJson(res, 200, { status: 'deleted', id });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Favorites: GET
  if (pathname === '/api/favorites' && method === 'GET') {
    try {
      let favs = [];
      if (!useJsonFallback) {
        favs = db.prepare("SELECT * FROM favorites ORDER BY created_at DESC").all();
      } else {
        favs = jsonDb.favorites;
      }
      return sendJson(res, 200, favs);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Favorites: POST (Toggle)
  if (pathname === '/api/favorites' && method === 'POST') {
    const data = await parseJsonBody(req);
    const dest_id = data.destination_id;
    const name = data.name;
    const country = data.country || '';
    const image = data.image || '';

    if (!dest_id || !name) {
      return sendJson(res, 400, { error: 'destination_id and name are required' });
    }

    try {
      if (!useJsonFallback) {
        const existing = db.prepare("SELECT id FROM favorites WHERE destination_id = ?").get(dest_id);
        if (existing) {
          db.prepare("DELETE FROM favorites WHERE destination_id = ?").run(dest_id);
          return sendJson(res, 200, { status: 'removed', destination_id: dest_id, is_favorite: false });
        } else {
          const stmt = db.prepare("INSERT INTO favorites (destination_id, name, country, image) VALUES (?, ?, ?, ?)");
          const resIns = stmt.run(dest_id, name, country, image);
          return sendJson(res, 201, { status: 'saved', id: Number(resIns.lastInsertRowid), destination_id: dest_id, is_favorite: true });
        }
      } else {
        const idx = jsonDb.favorites.findIndex(f => f.destination_id === dest_id);
        if (idx !== -1) {
          jsonDb.favorites.splice(idx, 1);
          saveJsonDb();
          return sendJson(res, 200, { status: 'removed', destination_id: dest_id, is_favorite: false });
        } else {
          const newFav = { id: jsonDb.favorites.length + 1, destination_id: dest_id, name, country, image, created_at: new Date().toISOString() };
          jsonDb.favorites.push(newFav);
          saveJsonDb();
          return sendJson(res, 201, { status: 'saved', id: newFav.id, destination_id: dest_id, is_favorite: true });
        }
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Rental Bookings: GET & POST
  if (pathname === '/api/rental-bookings' && method === 'GET') {
    try {
      const rows = !useJsonFallback
        ? db.prepare("SELECT * FROM rental_bookings ORDER BY created_at DESC").all()
        : jsonDb.rental_bookings;
      return sendJson(res, 200, rows);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/rental-bookings' && method === 'POST') {
    const data = await parseJsonBody(req);
    try {
      const vehicle_name = data.vehicle_name || 'Mountain Trail Bike';
      const vehicle_type = data.vehicle_type || 'Bicycle';
      const destination = data.destination || 'Current City';
      const rental_shop = data.rental_shop || 'Adventure Ride Station';
      const customer_name = data.customer_name || 'Traveler';
      const customer_phone = data.customer_phone || '';
      const customer_email = data.customer_email || '';
      const pickup_date = data.pickup_date || new Date().toISOString().split('T')[0];
      const duration_days = parseInt(data.duration_days) || 1;
      const total_price = parseFloat(data.total_price) || 25;

      if (!useJsonFallback) {
        const stmt = db.prepare(`
          INSERT INTO rental_bookings (vehicle_name, vehicle_type, destination, rental_shop, customer_name, customer_phone, customer_email, pickup_date, duration_days, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const resIns = stmt.run(vehicle_name, vehicle_type, destination, rental_shop, customer_name, customer_phone, customer_email, pickup_date, duration_days, total_price);
        return sendJson(res, 201, { status: 'confirmed', booking_id: Number(resIns.lastInsertRowid), vehicle_name, total_price });
      } else {
        const newBooking = {
          id: jsonDb.rental_bookings.length + 1,
          vehicle_name,
          vehicle_type,
          destination,
          rental_shop,
          customer_name,
          customer_phone,
          customer_email,
          pickup_date,
          duration_days,
          total_price,
          status: 'Confirmed',
          created_at: new Date().toISOString()
        };
        jsonDb.rental_bookings.push(newBooking);
        saveJsonDb();
        return sendJson(res, 201, { status: 'confirmed', booking_id: newBooking.id, vehicle_name, total_price });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Guide Inquiries: GET & POST
  if (pathname === '/api/guide-inquiries' && method === 'GET') {
    try {
      const rows = !useJsonFallback
        ? db.prepare("SELECT * FROM guide_inquiries ORDER BY created_at DESC").all()
        : jsonDb.guide_inquiries;
      return sendJson(res, 200, rows);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/guide-inquiries' && method === 'POST') {
    const data = await parseJsonBody(req);
    try {
      const guide_name = data.guide_name || 'Certified Local Guide';
      const destination = data.destination || 'Destination';
      const client_name = data.client_name || 'Traveler';
      const client_phone = data.client_phone || '';
      const client_email = data.client_email || '';
      const tour_date = data.tour_date || new Date().toISOString().split('T')[0];
      const group_size = parseInt(data.group_size) || 2;
      const selected_package = data.selected_package || 'Full Day Expedition';
      const special_requests = data.special_requests || '';

      if (!useJsonFallback) {
        const stmt = db.prepare(`
          INSERT INTO guide_inquiries (guide_name, destination, client_name, client_phone, client_email, tour_date, group_size, selected_package, special_requests)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const resIns = stmt.run(guide_name, destination, client_name, client_phone, client_email, tour_date, group_size, selected_package, special_requests);
        return sendJson(res, 201, { status: 'submitted', inquiry_id: Number(resIns.lastInsertRowid), guide_name });
      } else {
        const newInquiry = {
          id: jsonDb.guide_inquiries.length + 1,
          guide_name,
          destination,
          client_name,
          client_phone,
          client_email,
          tour_date,
          group_size,
          selected_package,
          special_requests,
          status: 'Submitted',
          created_at: new Date().toISOString()
        };
        jsonDb.guide_inquiries.push(newInquiry);
        saveJsonDb();
        return sendJson(res, 201, { status: 'submitted', inquiry_id: newInquiry.id, guide_name });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // --- STATIC FILE SERVING ---
  let filePath = '';
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (pathname === '/login' || pathname === '/signup' || pathname === '/login.html') {
    filePath = path.join(PUBLIC_DIR, 'login.html');
  } else {
    filePath = path.join(PUBLIC_DIR, pathname);
  }

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// Start Server with Port Fallback
function startListening(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Smart Trip Planner Server Running!`);
    console.log(`📍 Web App URL:    http://localhost:${port}`);
    console.log(`🔐 Login Page:     http://localhost:${port}/login`);
    console.log(`🗄️ Database:       ${useJsonFallback ? 'JSON Storage' : 'SQLite trips.db'}`);
    console.log(`====================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is occupied, trying port ${port + 1}...`);
      startListening(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startListening(PORT);
