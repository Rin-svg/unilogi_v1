require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Anthropic AI
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Base de données simulée (en production, utilisez MongoDB, PostgreSQL, etc.)
const users = [];
const verificationTokens = new Map();
const listings = []; // Annonces de logements
const messages = []; // Messages entre utilisateurs et bailleurs

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'authentification requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

// Fonction pour générer un token de vérification
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Fonction pour envoyer un email de vérification
async function sendVerificationEmail(email, token, name) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: '"UniLogi" <noreply@unilogi.com>',
    to: email,
    subject: '🎓 Vérifiez votre compte UniLogi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #09392D 0%, #389038 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #FFC80D; margin: 0; font-size: 32px;">UniLogi</h1>
          <p style="color: white; margin-top: 10px; font-size: 18px;">Bienvenue dans la communauté étudiante !</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #09392D; margin-top: 0;">Bonjour ${name} 👋</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Merci de vous être inscrit sur UniLogi ! Pour commencer à trouver votre logement idéal, 
            veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #FFC80D; color: #09392D; padding: 15px 40px; text-decoration: none; 
                      border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">
              Vérifier mon email
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${verificationUrl}" style="color: #389038; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            Ce lien expire dans 24 heures.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Si vous n'avez pas créé de compte sur UniLogi, ignorez cet email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de vérification envoyé:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

// ==================== ROUTES D'AUTHENTIFICATION ====================

// Route d'inscription avec bcrypt
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation des données
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Générer un token de vérification
    const verificationToken = generateVerificationToken();
    
    // Créer l'utilisateur
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date(),
    };

    users.push(newUser);
    
    // Stocker le token avec expiration (24h)
    verificationTokens.set(verificationToken, {
      userId: newUser.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verificationToken, name);

    res.status(201).json({
      message: 'Inscription réussie. Veuillez vérifier votre email.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de connexion avec JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Veuillez vérifier votre email avant de vous connecter',
        emailVerified: false,
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de vérification d'email
app.get('/api/auth/verify-email', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token manquant' });
    }

    // Vérifier le token
    const tokenData = verificationTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    // Vérifier l'expiration
    if (Date.now() > tokenData.expiresAt) {
      verificationTokens.delete(token);
      return res.status(400).json({ message: 'Token expiré' });
    }

    // Trouver et mettre à jour l'utilisateur
    const user = users.find(u => u.id === tokenData.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.emailVerified = true;
    verificationTokens.delete(token);

    res.json({
      message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      success: true,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour renvoyer l'email de vérification
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email déjà vérifié' });
    }

    // Générer un nouveau token
    const verificationToken = generateVerificationToken();
    
    verificationTokens.set(verificationToken, {
      userId: user.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await sendVerificationEmail(email, verificationToken, user.name);

    res.json({ message: 'Email de vérification renvoyé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== ROUTES DES ANNONCES ====================

// Récupérer toutes les annonces
app.get('/api/listings', authenticateToken, (req, res) => {
  res.json({ listings });
});

// Créer une nouvelle annonce
app.post('/api/listings', authenticateToken, (req, res) => {
  try {
    const { title, description, price, location, campus, images, amenities, type } = req.body;
    
    const newListing = {
      id: listings.length + 1,
      title,
      description,
      price,
      location,
      campus,
      images: images || [],
      amenities: amenities || [],
      type,
      ownerId: req.user.id,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      createdAt: new Date(),
    };
    
    listings.push(newListing);
    
    res.status(201).json({
      message: 'Annonce créée avec succès',
      listing: newListing,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== ROUTES DE MESSAGERIE ====================

// Envoyer un message au bailleur
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { listingId, message } = req.body;
    
    const listing = listings.find(l => l.id === parseInt(listingId));
    
    if (!listing) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    const newMessage = {
      id: messages.length + 1,
      listingId: parseInt(listingId),
      senderId: req.user.id,
      senderName: req.user.name,
      receiverId: listing.ownerId,
      receiverName: listing.ownerName,
      message,
      createdAt: new Date(),
      read: false,
    };
    
    messages.push(newMessage);
    
    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: newMessage,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les messages d'une conversation
app.get('/api/messages/:listingId', authenticateToken, (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;
    
    const conversation = messages.filter(m => 
      m.listingId === parseInt(listingId) && 
      (m.senderId === userId || m.receiverId === userId)
    );
    
    res.json({ messages: conversation });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== ROUTES IA ====================

// Chatbot IA pour répondre aux questions des étudiants
app.post('/api/ai/chatbot', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    const systemPrompt = `Tu es un assistant virtuel pour UniLogi, une plateforme de recherche de logements étudiants au Cameroun. 
    
Ton rôle est d'aider les étudiants avec leurs questions concernant:
- La recherche de logements près des campus
- Les prix moyens des logements
- Les quartiers recommandés pour les étudiants
- Les conseils pour visiter un logement
- Les démarches administratives pour la location
- Les droits et devoirs des locataires au Cameroun
- La cohabitation et la vie en colocation

Sois amical, professionnel et concis dans tes réponses. Si tu ne connais pas la réponse, dirige l'utilisateur vers le support client.`;

    const messages = [
      { role: 'assistant', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: messages,
    });

    res.json({
      response: response.content[0].text,
      conversationId: crypto.randomBytes(16).toString('hex'),
    });
  } catch (error) {
    console.error('Erreur IA Chatbot:', error);
    res.status(500).json({ 
      message: 'Erreur lors du traitement de votre demande',
      error: error.message 
    });
  }
});

// Recherche de logements avec IA basée sur les préférences
app.post('/api/ai/search-listings', authenticateToken, async (req, res) => {
  try {
    const { campus, preferences, budget } = req.body;
    
    const prompt = `Basé sur les informations suivantes:
- Campus: ${campus}
- Préférences: ${preferences}
- Budget: ${budget} FCFA

Génère une recherche intelligente de logements pour un étudiant. Liste 3-5 quartiers recommandés près de ce campus avec:
1. Le nom du quartier
2. Distance approximative du campus (en km)
3. Prix moyen d'un logement étudiant
4. Points positifs du quartier
5. Points d'attention

Format ta réponse en JSON avec cette structure:
{
  "recommendations": [
    {
      "neighborhood": "nom",
      "distance": "X km",
      "averagePrice": "montant FCFA",
      "pros": ["avantage1", "avantage2"],
      "cons": ["point d'attention1"]
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const aiResponse = response.content[0].text;
    
    // Tenter d'extraire le JSON de la réponse
    let recommendations;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };
    } catch (parseError) {
      recommendations = { recommendations: [], rawResponse: aiResponse };
    }

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Erreur IA Search:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la recherche intelligente',
      error: error.message 
    });
  }
});

// ==================== ROUTE DE TEST ====================

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend UniLogi fonctionne correctement !',
    features: {
      authentication: 'bcrypt + JWT',
      email: 'Nodemailer',
      ai: 'Anthropic Claude',
      security: 'HTTPS ready'
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend UniLogi démarré sur http://localhost:${PORT}`);
  console.log(`📧 Configuration email: ${process.env.EMAIL_HOST || 'smtp.ethereal.email'}`);
  console.log(`🤖 IA Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'Configurée' : 'Non configurée'}`);
  console.log(`🔒 Sécurité: bcrypt + JWT activés`);
});
