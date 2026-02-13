import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'unilogi_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unilogi_db',
  password: process.env.DB_PASSWORD || 'your_password_here',
  port: process.env.DB_PORT || 5432,
});

async function migrateLowdbToPostgres() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage de la migration depuis lowdb vers PostgreSQL...');
    
    // Lire le fichier db.json
    const dbJsonPath = process.argv[2] || './db.json';
    
    if (!fs.existsSync(dbJsonPath)) {
      console.error(`❌ Fichier ${dbJsonPath} non trouvé`);
      process.exit(1);
    }
    
    const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
    
    console.log('📊 Données trouvées:');
    console.log(`  - ${dbData.users?.length || 0} utilisateurs`);
    console.log(`  - ${dbData.apartments?.length || 0} appartements`);
    console.log(`  - ${dbData.favorites?.length || 0} favoris`);
    console.log(`  - ${dbData.messages?.length || 0} messages`);
    
    await client.query('BEGIN');
    
    // Migration des utilisateurs
    if (dbData.users && dbData.users.length > 0) {
      console.log('\n👥 Migration des utilisateurs...');
      
      for (const user of dbData.users) {
        try {
          await client.query(
            `INSERT INTO users (id, email, password, name, email_verified, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [
              user.id,
              user.email,
              user.password, // Déjà hashé
              user.name,
              user.emailVerified || false,
              user.verified || false
            ]
          );
          console.log(`  ✓ Utilisateur migré: ${user.email}`);
        } catch (error) {
          console.error(`  ✗ Erreur utilisateur ${user.email}:`, error.message);
        }
      }
    }
    
    // Migration des appartements
    if (dbData.apartments && dbData.apartments.length > 0) {
      console.log('\n🏠 Migration des appartements...');
      
      for (const apt of dbData.apartments) {
        try {
          await client.query(
            `INSERT INTO apartments (title, address, latitude, longitude, price, rooms, surface, description, images, furnished, pet_friendly, has_parking, landlord_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              apt.title,
              apt.address,
              apt.latitude,
              apt.longitude,
              apt.price,
              apt.rooms,
              apt.surface,
              apt.description,
              JSON.stringify(apt.images || []),
              apt.furnished || false,
              apt.petFriendly || false,
              apt.hasParking || false,
              apt.landlordId
            ]
          );
          console.log(`  ✓ Appartement migré: ${apt.title}`);
        } catch (error) {
          console.error(`  ✗ Erreur appartement ${apt.title}:`, error.message);
        }
      }
    }
    
    // Migration des favoris
    if (dbData.favorites && dbData.favorites.length > 0) {
      console.log('\n⭐ Migration des favoris...');
      
      for (const fav of dbData.favorites) {
        try {
          await client.query(
            `INSERT INTO favorites (user_id, apartment_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, apartment_id) DO NOTHING`,
            [fav.userId, fav.apartmentId]
          );
          console.log(`  ✓ Favori migré: user ${fav.userId} -> apt ${fav.apartmentId}`);
        } catch (error) {
          console.error(`  ✗ Erreur favori:`, error.message);
        }
      }
    }
    
    // Migration des messages
    if (dbData.messages && dbData.messages.length > 0) {
      console.log('\n💬 Migration des messages...');
      
      for (const msg of dbData.messages) {
        try {
          await client.query(
            `INSERT INTO messages (sender_id, receiver_id, content, apartment_id, read)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              msg.senderId,
              msg.receiverId,
              msg.content,
              msg.apartmentId,
              msg.read || false
            ]
          );
          console.log(`  ✓ Message migré: ${msg.senderId} -> ${msg.receiverId}`);
        } catch (error) {
          console.error(`  ✗ Erreur message:`, error.message);
        }
      }
    }
    
    // Migration des paramètres de confidentialité
    if (dbData.privacySettings && dbData.privacySettings.length > 0) {
      console.log('\n🔒 Migration des paramètres de confidentialité...');
      
      for (const settings of dbData.privacySettings) {
        try {
          await client.query(
            `INSERT INTO privacy_settings (user_id, settings)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET settings = $2`,
            [settings.userId, JSON.stringify(settings.settings)]
          );
          console.log(`  ✓ Paramètres migrés pour user ${settings.userId}`);
        } catch (error) {
          console.error(`  ✗ Erreur paramètres:`, error.message);
        }
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n📊 Vérification des données migrées:');
    
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const aptCount = await client.query('SELECT COUNT(*) FROM apartments');
    const favCount = await client.query('SELECT COUNT(*) FROM favorites');
    const msgCount = await client.query('SELECT COUNT(*) FROM messages');
    
    console.log(`  - ${userCount.rows[0].count} utilisateurs`);
    console.log(`  - ${aptCount.rows[0].count} appartements`);
    console.log(`  - ${favCount.rows[0].count} favoris`);
    console.log(`  - ${msgCount.rows[0].count} messages`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
migrateLowdbToPostgres().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
