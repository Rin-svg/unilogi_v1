import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;
import https from 'https';
import http from 'http';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const HTTP_PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const JWT_SECRET = process.env.JWT_SECRET || 'unilogi-secret-key-2024-CHANGE-IN-PRODUCTION';

// Configuration PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'unilogi_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unilogi_db',
  password: process.env.DB_PASSWORD || 'your_password_here',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
  process.exit(-1);
});

// ===== SÉCURITÉ =====

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://maps.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com"],
      frameSrc: ["https://maps.googleapis.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:3001',
  'https://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La politique CORS ne permet pas l\'accès depuis cette origine.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes. Réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== VALIDATION FUNCTIONS =====

const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new Error('Email invalide');
  }
  return validator.normalizeEmail(email);
};

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins un chiffre');
  }
  return password;
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

// ===== AUTH MIDDLEWARE =====

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====

app.post('/api/register', authLimiter, async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, name } = req.body;
    
    const validatedEmail = validateEmail(email);
    validatePassword(password);

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [validatedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await client.query(
      'INSERT INTO users (email, password, name, email_verified, verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, email_verified, verified',
      [validatedEmail, hashedPassword, sanitizeInput(name), false, false]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l\'inscription' });
  } finally {
    client.release();
  }
});

app.post('/api/login', authLimiter, async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;
    const validatedEmail = validateEmail(email);

    const result = await client.query(
      'SELECT id, email, password, name, email_verified, verified FROM users WHERE email = $1',
      [validatedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        emailVerified: user.email_verified,
        verified: user.verified 
      } 
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la connexion' });
  } finally {
    client.release();
  }
});

// ===== APARTMENTS ROUTES =====

app.get('/api/apartments', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM apartments ORDER BY created_at DESC'
    );
    res.json({ apartments: result.rows });
  } catch (error) {
    console.error('Erreur récupération appartements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des logements' });
  } finally {
    client.release();
  }
});

app.get('/api/apartments/:id', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM apartments WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Logement non trouvé' });
    }
    
    res.json({ apartment: result.rows[0] });
  } catch (error) {
    console.error('Erreur récupération appartement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du logement' });
  } finally {
    client.release();
  }
});

app.post('/api/apartments', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, address, latitude, longitude, price, rooms, surface, description, images, furnished, petFriendly, hasParking } = req.body;

    const result = await client.query(
      `INSERT INTO apartments (title, address, latitude, longitude, price, rooms, surface, description, images, furnished, pet_friendly, has_parking, landlord_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        sanitizeInput(title),
        sanitizeInput(address),
        latitude,
        longitude,
        price,
        rooms,
        surface,
        sanitizeInput(description),
        JSON.stringify(images || []),
        furnished || false,
        petFriendly || false,
        hasParking || false,
        req.user.id
      ]
    );

    res.json({ apartment: result.rows[0] });
  } catch (error) {
    console.error('Erreur création appartement:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  } finally {
    client.release();
  }
});

// ===== FAVORITES ROUTES =====

app.get('/api/favorites', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT a.* FROM apartments a
       INNER JOIN favorites f ON a.id = f.apartment_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  } finally {
    client.release();
  }
});

app.post('/api/favorites/:apartmentId', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const apartmentId = parseInt(req.params.apartmentId);

    const result = await client.query(
      'INSERT INTO favorites (user_id, apartment_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, apartmentId]
    );

    res.json({ favorite: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Déjà dans les favoris' });
    }
    console.error('Erreur ajout favori:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  } finally {
    client.release();
  }
});

app.delete('/api/favorites/:apartmentId', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const apartmentId = parseInt(req.params.apartmentId);
    
    await client.query(
      'DELETE FROM favorites WHERE user_id = $1 AND apartment_id = $2',
      [req.user.id, apartmentId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  } finally {
    client.release();
  }
});

// ===== PRIVACY SETTINGS ROUTES =====

app.get('/api/privacy-settings', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT settings FROM privacy_settings WHERE user_id = $1',
      [req.user.id]
    );
    
    res.json({ settings: result.rows.length > 0 ? result.rows[0].settings : {} });
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  } finally {
    client.release();
  }
});

app.put('/api/privacy-settings', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO privacy_settings (user_id, settings)
       VALUES ($1, $2)
       ON CONFLICT (user_id) 
       DO UPDATE SET settings = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, JSON.stringify(req.body.settings)]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  } finally {
    client.release();
  }
});

// ===== DATA MANAGEMENT ROUTES =====

app.get('/api/download-data', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      'SELECT id, email, name, email_verified, verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const favoritesResult = await client.query(
      'SELECT * FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    
    const messagesResult = await client.query(
      'SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1',
      [req.user.id]
    );
    
    const privacyResult = await client.query(
      'SELECT settings FROM privacy_settings WHERE user_id = $1',
      [req.user.id]
    );

    const userData = {
      user: userResult.rows[0],
      favorites: favoritesResult.rows,
      messages: messagesResult.rows,
      privacySettings: privacyResult.rows.length > 0 ? privacyResult.rows[0] : {},
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=mes-donnees-unilogi.json');
    res.json(userData);
  } catch (error) {
    console.error('Erreur export données:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  } finally {
    client.release();
  }
});

app.delete('/api/delete-account', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Les contraintes ON DELETE CASCADE supprimeront automatiquement
    // les favoris, messages, paramètres et appartements liés
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur suppression compte:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  } finally {
    client.release();
  }
});

// ===== MESSAGES ROUTES =====

app.get('/api/messages', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  } finally {
    client.release();
  }
});

app.post('/api/messages', apiLimiter, authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const content = sanitizeInput(req.body.content);
    
    const result = await client.query(
      `INSERT INTO messages (sender_id, receiver_id, content, apartment_id, read)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, req.body.receiverId, content, req.body.apartmentId, false]
    );

    res.json({ message: result.rows[0] });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi' });
  } finally {
    client.release();
  }
});

// ===== GOOGLE PLACES API ROUTES =====

app.get('/api/places/search', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const { query, location } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Paramètre query requis' });
    }

    // Cette route sera utilisée par le frontend pour rechercher des lieux
    // Le frontend utilisera directement l'API Google Places avec sa clé
    res.json({ 
      message: 'Utilisez l\'API Google Places directement depuis le frontend',
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (error) {
    console.error('Erreur recherche Places:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    https: process.env.USE_HTTPS === 'true'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ===== DÉMARRAGE DU SERVEUR =====

const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await pool.query('SELECT NOW()');
    console.log('✅ Base de données PostgreSQL connectée');

    // Serveur HTTP
    const httpServer = http.createServer(app);
    httpServer.listen(HTTP_PORT, () => {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🚀 UniLogi Backend Server - PostgreSQL Edition');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`📡 HTTP Server: http://localhost:${HTTP_PORT}`);
      console.log(`🗄️  Base de données: PostgreSQL`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔒 Sécurité activée:');
      console.log('   ✓ Helmet (Headers sécurisés)');
      console.log('   ✓ CORS configuré');
      console.log('   ✓ Rate limiting');
      console.log('   ✓ Validation des données');
      console.log('   ✓ Hashing bcrypt (coût 12)');
      console.log('   ✓ JWT avec expiration');
      console.log('   ✓ Google Places API activée');
      console.log('═══════════════════════════════════════════════════════════');
    });

    // Serveur HTTPS (production)
    if (process.env.USE_HTTPS === 'true') {
      try {
        const httpsOptions = {
          key: fs.readFileSync(join(__dirname, 'ssl', 'server.key')),
          cert: fs.readFileSync(join(__dirname, 'ssl', 'server.cert'))
        };

        const httpsServer = https.createServer(httpsOptions, app);
        httpsServer.listen(HTTPS_PORT, () => {
          console.log(`🔐 HTTPS Server: https://localhost:${HTTPS_PORT}`);
        });
      } catch (error) {
        console.error('❌ Erreur lors du démarrage HTTPS:', error.message);
        console.log('💡 Utilisez le script generate-ssl.sh pour générer les certificats SSL');
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;
