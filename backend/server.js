import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const HTTP_PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const JWT_SECRET = process.env.JWT_SECRET || 'unilogi-secret-key-2024-CHANGE-IN-PRODUCTION';

// ===== SÉCURITÉ =====

// Helmet pour sécuriser les headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuré de manière sécurisée
// Origines autorisées : localhost + URL Netlify définie dans FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:3001',
  'https://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (comme les apps mobiles ou Postman)
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

// Rate limiting pour prévenir les attaques par force brute
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives maximum
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes maximum
  message: 'Trop de requêtes. Réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database setup
const dbFile = join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, {});

// Initialize database
await db.read();
db.data ||= { 
  users: [], 
  apartments: [], 
  favorites: [],
  messages: [],
  privacySettings: [],
  savedRoutes: [],
  communityPosts: [],
  postComments: []
};
await db.write();

// Sample apartments data with real locations in Paris
const sampleApartments = [
  {
    id: 1,
    title: "Studio moderne Quartier Latin",
    address: "12 Rue de la Harpe, 75005 Paris",
    latitude: 48.8520,
    longitude: 2.3434,
    price: 850,
    rooms: 1,
    surface: 25,
    description: "Charmant studio au cœur du Quartier Latin, proche de la Sorbonne",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
    furnished: true,
    petFriendly: false,
    hasParking: false,
    landlordId: "landlord1"
  },
  {
    id: 2,
    title: "T2 Montmartre avec vue",
    address: "45 Rue Lepic, 75018 Paris",
    latitude: 48.8867,
    longitude: 2.3350,
    price: 1200,
    rooms: 2,
    surface: 45,
    description: "Bel appartement avec vue sur Sacré-Cœur",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"],
    furnished: true,
    petFriendly: true,
    hasParking: false,
    landlordId: "landlord2"
  },
  {
    id: 3,
    title: "T3 Marais spacieux",
    address: "18 Rue des Francs Bourgeois, 75003 Paris",
    latitude: 48.8583,
    longitude: 2.3606,
    price: 1650,
    rooms: 3,
    surface: 65,
    description: "Grand appartement familial dans le Marais historique",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
    furnished: false,
    petFriendly: true,
    hasParking: true,
    landlordId: "landlord1"
  },
  {
    id: 4,
    title: "Studio Saint-Germain",
    address: "28 Rue de Seine, 75006 Paris",
    latitude: 48.8544,
    longitude: 2.3363,
    price: 950,
    rooms: 1,
    surface: 28,
    description: "Studio élégant à Saint-Germain-des-Prés",
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb"],
    furnished: true,
    petFriendly: false,
    hasParking: false,
    landlordId: "landlord3"
  },
  {
    id: 5,
    title: "T2 Bastille moderne",
    address: "56 Rue de la Roquette, 75011 Paris",
    latitude: 48.8554,
    longitude: 2.3764,
    price: 1100,
    rooms: 2,
    surface: 50,
    description: "Appartement rénové près de Bastille",
    images: ["https://images.unsplash.com/photo-1556912173-3bb406ef7e77"],
    furnished: true,
    petFriendly: false,
    hasParking: true,
    landlordId: "landlord2"
  },
  {
    id: 6,
    title: "T4 République familial",
    address: "34 Boulevard du Temple, 75003 Paris",
    latitude: 48.8628,
    longitude: 2.3662,
    price: 1900,
    rooms: 4,
    surface: 85,
    description: "Grand appartement parfait pour une famille",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"],
    furnished: false,
    petFriendly: true,
    hasParking: true,
    landlordId: "landlord3"
  },
  {
    id: 7,
    title: "Studio Étoile chic",
    address: "12 Avenue Marceau, 75008 Paris",
    latitude: 48.8692,
    longitude: 2.2997,
    price: 1050,
    rooms: 1,
    surface: 30,
    description: "Studio haut de gamme proche de l'Arc de Triomphe",
    images: ["https://images.unsplash.com/photo-1502672023488-70e25813eb80"],
    furnished: true,
    petFriendly: false,
    hasParking: false,
    landlordId: "landlord1"
  },
  {
    id: 8,
    title: "T2 Canal Saint-Martin",
    address: "78 Quai de Valmy, 75010 Paris",
    latitude: 48.8721,
    longitude: 2.3645,
    price: 1250,
    rooms: 2,
    surface: 48,
    description: "Appartement avec vue sur le canal",
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb"],
    furnished: true,
    petFriendly: true,
    hasParking: false,
    landlordId: "landlord2"
  }
];

// Initialize sample data if database is empty
if (!db.data?.apartments || db.data.apartments.length === 0) {
  db.data.apartments = sampleApartments;
  await db.write();
}

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
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====

// 🆕 ROUTE D'INSCRIPTION (MANQUANTE DANS L'ORIGINAL)
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation des données
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Le nom doit contenir au moins 2 caractères' });
    }

    const validatedEmail = validateEmail(email);
    validatePassword(password);

    // Vérifier si l'email existe déjà
    await db.read();
    const existingUser = db.data.users.find(u => u.email === validatedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      name: sanitizeInput(name),
      email: validatedEmail,
      password: hashedPassword,
      emailVerified: false, // Système de vérification email (à implémenter)
      verified: false,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(newUser);
    await db.write();

    // Retourner succès (sans le mot de passe)
    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de l\'inscription' });
  }
});

// Route de connexion
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    await db.read();
    
    const validatedEmail = validateEmail(email);
    
    if (!validatedEmail) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const user = db.data.users.find(u => u.email === validatedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Token JWT avec expiration
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
        emailVerified: user.emailVerified || false,
        verified: user.verified 
      } 
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la connexion' });
  }
});

// ===== APARTMENTS ROUTES =====

app.get('/api/apartments', apiLimiter, authenticateToken, (req, res) => {
  res.json({ apartments: db.data.apartments });
});

app.get('/api/apartments/:id', apiLimiter, authenticateToken, (req, res) => {
  const apartment = db.data.apartments.find(a => a.id === parseInt(req.params.id));
  if (!apartment) {
    return res.status(404).json({ error: 'Logement non trouvé' });
  }
  res.json({ apartment });
});

app.post('/api/apartments', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const { title, location, price, rooms, surface, description, contact, image, furnished, petFriendly, hasParking } = req.body;
    
    if (!title || !location || !price) {
      return res.status(400).json({ error: 'Titre, localisation et prix sont requis' });
    }

    // Générer une latitude/longitude aléatoire proche de Yaoundé pour la démo
    const latitude = 3.848 + (Math.random() - 0.5) * 0.1;
    const longitude = 11.502 + (Math.random() - 0.5) * 0.1;

    const apartment = {
      id: Date.now(),
      title: sanitizeInput(title),
      location: sanitizeInput(location),
      address: sanitizeInput(location),
      latitude,
      longitude,
      price: parseInt(price),
      rooms: parseInt(rooms) || 1,
      surface: parseInt(surface) || 25,
      description: sanitizeInput(description),
      contact: sanitizeInput(contact),
      image: image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      images: [image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      furnished: furnished !== false,
      petFriendly: petFriendly === true,
      hasParking: hasParking === true,
      landlordId: req.user.id,
      isCertified: false,
      status: 'disponible',
      createdAt: new Date().toISOString()
    };

    db.data.apartments.push(apartment);
    await db.write();

    res.json({ apartment, message: 'Appartement créé avec succès' });
  } catch (error) {
    console.error('Erreur création appartement:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// ===== FAVORITES ROUTES =====

app.get('/api/favorites', apiLimiter, authenticateToken, (req, res) => {
  const userFavorites = db.data.favorites.filter(f => f.userId === req.user.id);
  const favoriteApartments = userFavorites.map(f => {
    const apartment = db.data.apartments.find(a => a.id === f.apartmentId);
    return apartment;
  }).filter(Boolean);

  res.json({ favorites: favoriteApartments });
});

app.post('/api/favorites/:apartmentId', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const apartmentId = parseInt(req.params.apartmentId);
    const existing = db.data.favorites.find(
      f => f.userId === req.user.id && f.apartmentId === apartmentId
    );

    if (existing) {
      return res.status(400).json({ error: 'Déjà dans les favoris' });
    }

    const favorite = {
      id: Date.now(),
      userId: req.user.id,
      apartmentId,
      createdAt: new Date().toISOString()
    };

    db.data.favorites.push(favorite);
    await db.write();

    res.json({ favorite });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  }
});

app.delete('/api/favorites/:apartmentId', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const apartmentId = parseInt(req.params.apartmentId);
    db.data.favorites = db.data.favorites.filter(
      f => !(f.userId === req.user.id && f.apartmentId === apartmentId)
    );
    await db.write();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ===== PRIVACY SETTINGS ROUTES =====

app.get('/api/privacy-settings', apiLimiter, authenticateToken, (req, res) => {
  const settings = db.data.privacySettings.find(s => s.userId === req.user.id);
  res.json({ settings: settings?.settings || {} });
});

app.put('/api/privacy-settings', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const existingIndex = db.data.privacySettings.findIndex(s => s.userId === req.user.id);
    
    if (existingIndex >= 0) {
      db.data.privacySettings[existingIndex].settings = req.body.settings;
    } else {
      db.data.privacySettings.push({
        userId: req.user.id,
        settings: req.body.settings
      });
    }

    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// ===== DATA MANAGEMENT ROUTES =====

app.get('/api/download-data', apiLimiter, authenticateToken, (req, res) => {
  const userData = {
    user: db.data.users.find(u => u.id === req.user.id),
    favorites: db.data.favorites.filter(f => f.userId === req.user.id),
    messages: db.data.messages.filter(m => m.userId === req.user.id),
    privacySettings: db.data.privacySettings.find(s => s.userId === req.user.id),
    exportedAt: new Date().toISOString()
  };

  // Supprimer le mot de passe de l'export
  if (userData.user) {
    delete userData.user.password;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=mes-donnees-unilogi.json');
  res.json(userData);
});

app.delete('/api/delete-account', apiLimiter, authenticateToken, async (req, res) => {
  try {
    db.data.users = db.data.users.filter(u => u.id !== req.user.id);
    db.data.favorites = db.data.favorites.filter(f => f.userId !== req.user.id);
    db.data.messages = db.data.messages.filter(m => m.userId !== req.user.id);
    db.data.privacySettings = db.data.privacySettings.filter(s => s.userId !== req.user.id);
    db.data.apartments = db.data.apartments.filter(a => a.landlordId !== req.user.id);

    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ===== MESSAGES ROUTES =====

app.get('/api/messages', apiLimiter, authenticateToken, (req, res) => {
  const messages = db.data.messages.filter(
    m => m.senderId === req.user.id || m.receiverId === req.user.id
  );
  res.json({ messages });
});

app.post('/api/messages', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const content = sanitizeInput(req.body.content);
    
    const message = {
      id: Date.now(),
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      content,
      apartmentId: req.body.apartmentId,
      createdAt: new Date().toISOString(),
      read: false
    };

    db.data.messages.push(message);
    await db.write();

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi' });
  }
});

// ===== COMMUNITY POSTS ROUTES =====

// Récupérer tous les posts
app.get('/api/community/posts', apiLimiter, authenticateToken, (req, res) => {
  const posts = (db.data.communityPosts || []).map(post => ({
    ...post,
    like_count: post.likes || 0,
    comment_count: (db.data.postComments || []).filter(c => c.postId === post.id).length,
    user_liked: (post.likedBy || []).includes(req.user.id)
  }));
  
  res.json({ posts: posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

// Créer un nouveau post
app.post('/api/community/posts', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const { content, image_url } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le contenu est requis' });
    }

    const user = db.data.users.find(u => u.id === req.user.id);
    const userName = user?.name || 'Utilisateur';
    
    const post = {
      id: Date.now(),
      userId: req.user.id,
      author_name: userName,
      author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
      content: sanitizeInput(content),
      image_url: image_url || null,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.data.communityPosts = db.data.communityPosts || [];
    db.data.communityPosts.push(post);
    await db.write();

    res.json({ post: {
      ...post,
      like_count: 0,
      comment_count: 0,
      user_liked: false
    }});
  } catch (error) {
    console.error('Erreur création post:', error);
    res.status(500).json({ error: 'Erreur lors de la création du post' });
  }
});

// Liker/Unliker un post
app.post('/api/community/posts/:postId/like', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    db.data.communityPosts = db.data.communityPosts || [];
    
    const post = db.data.communityPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    post.likedBy = post.likedBy || [];
    const userIndex = post.likedBy.indexOf(req.user.id);
    
    if (userIndex > -1) {
      // Unlike
      post.likedBy.splice(userIndex, 1);
      post.likes = (post.likes || 1) - 1;
      await db.write();
      res.json({ liked: false, message: 'Like retiré' });
    } else {
      // Like
      post.likedBy.push(req.user.id);
      post.likes = (post.likes || 0) + 1;
      await db.write();
      res.json({ liked: true, message: 'Post liké' });
    }
  } catch (error) {
    console.error('Erreur like post:', error);
    res.status(500).json({ error: 'Erreur lors du like' });
  }
});

// Supprimer un post
app.delete('/api/community/posts/:postId', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    db.data.communityPosts = db.data.communityPosts || [];
    
    const postIndex = db.data.communityPosts.findIndex(p => p.id === postId && p.userId === req.user.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post non trouvé ou non autorisé' });
    }

    db.data.communityPosts.splice(postIndex, 1);
    await db.write();

    res.json({ success: true, message: 'Post supprimé' });
  } catch (error) {
    console.error('Erreur suppression post:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Ajouter un commentaire
app.post('/api/community/posts/:postId/comments', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le commentaire est requis' });
    }

    const user = db.data.users.find(u => u.id === req.user.id);
    const userName = user?.name || 'Utilisateur';

    const comment = {
      id: Date.now(),
      postId,
      userId: req.user.id,
      author_name: userName,
      content: sanitizeInput(content),
      createdAt: new Date().toISOString()
    };

    db.data.postComments = db.data.postComments || [];
    db.data.postComments.push(comment);
    await db.write();

    res.json({ comment });
  } catch (error) {
    console.error('Erreur création commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
});

// Récupérer les commentaires d'un post
app.get('/api/community/posts/:postId/comments', apiLimiter, authenticateToken, (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    db.data.postComments = db.data.postComments || [];
    
    const comments = db.data.postComments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ comments });
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
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

// Serveur HTTP (dev uniquement)
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 UniLogi Backend Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📡 HTTP Server: http://localhost:${HTTP_PORT}`);
  console.log(`📊 Base de données: ${dbFile}`);
  console.log(`🏠 ${db.data.apartments.length} logements disponibles`);
  console.log(`👥 ${db.data?.users?.length || 0} utilisateurs enregistrés`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔒 Sécurité activée:');
  console.log('   ✓ Helmet (Headers sécurisés)');
  console.log('   ✓ CORS configuré');
  console.log('   ✓ Rate limiting');
  console.log('   ✓ Validation des données');
  console.log('   ✓ Hashing bcrypt (coût 12)');
  console.log('   ✓ JWT avec expiration');
  console.log('═══════════════════════════════════════════════════════════');
});

// Sur Render, le HTTPS est géré automatiquement par la plateforme.
// Pas besoin de certificats SSL manuels.

export default app;
