import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  Credential: true
}));
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'unilogi-secret-key-2024';

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
  savedRoutes: []
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

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
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

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = db.data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      verified: false,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(user);
    await db.write();

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ===== APARTMENTS ROUTES =====

app.get('/api/apartments', authenticateToken, (req, res) => {
  res.json({ apartments: db.data.apartments });
});

app.get('/api/apartments/:id', authenticateToken, (req, res) => {
  const apartment = db.data.apartments.find(a => a.id === parseInt(req.params.id));
  if (!apartment) {
    return res.status(404).json({ error: 'Logement non trouvé' });
  }
  res.json({ apartment });
});

app.post('/api/apartments', authenticateToken, async (req, res) => {
  try {
    const apartment = {
      id: Date.now(),
      ...req.body,
      landlordId: req.user.id,
      createdAt: new Date().toISOString()
    };

    db.data.apartments.push(apartment);
    await db.write();

    res.json({ apartment });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// ===== FAVORITES ROUTES =====

app.get('/api/favorites', authenticateToken, (req, res) => {
  const userFavorites = db.data.favorites.filter(f => f.userId === req.user.id);
  const favoriteApartments = userFavorites.map(f => {
    const apartment = db.data.apartments.find(a => a.id === f.apartmentId);
    return apartment;
  }).filter(Boolean);

  res.json({ favorites: favoriteApartments });
});

app.post('/api/favorites/:apartmentId', authenticateToken, async (req, res) => {
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

app.delete('/api/favorites/:apartmentId', authenticateToken, async (req, res) => {
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

app.get('/api/privacy-settings', authenticateToken, (req, res) => {
  const settings = db.data.privacySettings.find(s => s.userId === req.user.id);
  res.json({ settings: settings?.settings || {} });
});

app.put('/api/privacy-settings', authenticateToken, async (req, res) => {
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

app.get('/api/download-data', authenticateToken, (req, res) => {
  const userData = {
    user: db.data.users.find(u => u.id === req.user.id),
    favorites: db.data.favorites.filter(f => f.userId === req.user.id),
    messages: db.data.messages.filter(m => m.userId === req.user.id),
    privacySettings: db.data.privacySettings.find(s => s.userId === req.user.id),
    exportedAt: new Date().toISOString()
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=mes-donnees-unilogi.json');
  res.json(userData);
});

app.delete('/api/delete-account', authenticateToken, async (req, res) => {
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

app.get('/api/messages', authenticateToken, (req, res) => {
  const messages = db.data.messages.filter(
    m => m.senderId === req.user.id || m.receiverId === req.user.id
  );
  res.json({ messages });
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const message = {
      id: Date.now(),
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      content: req.body.content,
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Base de données: ${dbFile}`);
  console.log(`🏠 ${db.data.apartments.length} logements disponibles`);
  console.log(`👥 ${db.data?.users?.length ||0} utilisateurs enregistrés`);
});

export default app;
