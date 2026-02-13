-- Données de démonstration pour UniLogi
-- À exécuter après schema.sql

-- Créer un utilisateur propriétaire de démonstration
INSERT INTO users (id, email, password, name, email_verified, verified)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'landlord1@unilogi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyFBgE3Qp2aC', 'Propriétaire 1', true, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'landlord2@unilogi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyFBgE3Qp2aC', 'Propriétaire 2', true, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'landlord3@unilogi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyFBgE3Qp2aC', 'Propriétaire 3', true, true);

-- Insérer les appartements de démonstration
INSERT INTO apartments (title, address, latitude, longitude, price, rooms, surface, description, images, furnished, pet_friendly, has_parking, landlord_id)
VALUES 
    (
        'Studio moderne Quartier Latin',
        '12 Rue de la Harpe, 75005 Paris',
        48.8520,
        2.3434,
        850,
        1,
        25,
        'Charmant studio au cœur du Quartier Latin, proche de la Sorbonne',
        '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]'::jsonb,
        true,
        false,
        false,
        '550e8400-e29b-41d4-a716-446655440001'
    ),
    (
        'T2 Montmartre avec vue',
        '45 Rue Lepic, 75018 Paris',
        48.8867,
        2.3350,
        1200,
        2,
        45,
        'Bel appartement avec vue sur Sacré-Cœur',
        '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]'::jsonb,
        true,
        true,
        false,
        '550e8400-e29b-41d4-a716-446655440002'
    ),
    (
        'T3 Marais spacieux',
        '18 Rue des Francs Bourgeois, 75003 Paris',
        48.8583,
        2.3606,
        1650,
        3,
        65,
        'Grand appartement familial dans le Marais historique',
        '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]'::jsonb,
        false,
        true,
        true,
        '550e8400-e29b-41d4-a716-446655440001'
    ),
    (
        'Studio Saint-Germain',
        '28 Rue de Seine, 75006 Paris',
        48.8544,
        2.3363,
        950,
        1,
        28,
        'Studio élégant à Saint-Germain-des-Prés',
        '["https://images.unsplash.com/photo-1493809842364-78817add7ffb"]'::jsonb,
        true,
        false,
        false,
        '550e8400-e29b-41d4-a716-446655440003'
    ),
    (
        'T2 Bastille moderne',
        '56 Rue de la Roquette, 75011 Paris',
        48.8554,
        2.3764,
        1100,
        2,
        50,
        'Appartement rénové près de Bastille',
        '["https://images.unsplash.com/photo-1556912173-3bb406ef7e77"]'::jsonb,
        true,
        false,
        true,
        '550e8400-e29b-41d4-a716-446655440002'
    ),
    (
        'T4 République familial',
        '34 Boulevard du Temple, 75003 Paris',
        48.8628,
        2.3662,
        1900,
        4,
        85,
        'Grand appartement parfait pour une famille',
        '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]'::jsonb,
        false,
        true,
        true,
        '550e8400-e29b-41d4-a716-446655440003'
    ),
    (
        'Studio Étoile chic',
        '12 Avenue Marceau, 75008 Paris',
        48.8692,
        2.2997,
        1050,
        1,
        30,
        'Studio haut de gamme proche de l''Arc de Triomphe',
        '["https://images.unsplash.com/photo-1502672023488-70e25813eb80"]'::jsonb,
        true,
        false,
        false,
        '550e8400-e29b-41d4-a716-446655440001'
    ),
    (
        'T2 Canal Saint-Martin',
        '78 Quai de Valmy, 75010 Paris',
        48.8721,
        2.3645,
        1250,
        2,
        48,
        'Appartement avec vue sur le canal',
        '["https://images.unsplash.com/photo-1554995207-c18c203602cb"]'::jsonb,
        true,
        true,
        false,
        '550e8400-e29b-41d4-a716-446655440002'
    );

-- Note: Le mot de passe hashé correspond à "Password123!" pour tous les utilisateurs de démonstration
