-- Ajout de la table pour les posts de la communauté
CREATE TABLE IF NOT EXISTS community_posts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);

-- Table pour les likes des posts
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

-- Index pour les likes
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- Table pour les commentaires
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour les commentaires
CREATE INDEX idx_post_comments_post ON post_comments(post_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_community_posts_updated_at 
BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques posts de démonstration
INSERT INTO community_posts (user_id, author_name, author_avatar, content, image_url, likes)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Marie Tchowoung',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
        'Vient de trouver un appart incroyable à Yaoundé! Très recommandé pour les étudiants de Poly 🏠',
        'https://images.unsplash.com/photo-1554995207-c18e338bda41?auto=format&fit=crop&w=400',
        45
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Jean Kuate',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
        'Des conseils pour négocier le prix du loyer? C''est ma première fois 😅',
        NULL,
        23
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003',
        'Sylvie Nkongolo',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sylvie',
        'Attention aux escroqueries! Vérifiez toujours la propriété avant de signer. Nous avons eu une mauvaise expérience...',
        NULL,
        156
    );
