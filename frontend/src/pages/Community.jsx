import { Heart, MessageCircle, Share2, Search } from 'lucide-react';
import { useState } from 'react';

const Community = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Marie Tchowoung',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
      time: 'Il y a 2h',
      content: 'Vient de trouver un appart incroyable à Yaoundé! Très recommandé pour les étudiants de Poly 🏠',
      image: 'https://images.unsplash.com/photo-1554995207-c18e338bda41?auto=format&fit=crop&w=400',
      likes: 45,
      comments: 12,
      liked: false
    },
    {
      id: 2,
      author: 'Jean Kuate',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
      time: 'Il y a 4h',
      content: 'Des conseils pour négocier le prix du loyer? C\'est ma première fois 😅',
      likes: 23,
      comments: 34,
      liked: false
    },
    {
      id: 3,
      author: 'Sylvie Nkongolo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sylvie',
      time: 'Il y a 6h',
      content: 'Attention aux escroqueries! Vérifiez toujours la propriété avant de signer. Nous avons eu une mauvaise expérience...',
      likes: 156,
      comments: 89,
      liked: false
    },
  ]);

  const [newPost, setNewPost] = useState('');

  const handleLike = (id) => {
    setPosts(posts.map(post => 
      post.id === id 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: 'Vous',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        time: 'À l\'instant',
        content: newPost,
        likes: 0,
        comments: 0,
        liked: false
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  return (
    <div className="pb-24">
      {/* Header avec barre de recherche */}
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6 pb-8">
        <h2 className="text-2xl font-bold mb-4">Communauté</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher des posts..." 
            className="w-full bg-white/20 border border-white/30 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#FFC80D]"
          />
        </div>
      </div>

      {/* Zone de créer un post */}
      <div className="bg-white p-4 border-b border-gray-100 sticky top-16 z-40">
        <div className="flex gap-3">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" 
            alt="Avatar" 
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 flex gap-2">
            <input 
              type="text"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFC80D] focus:bg-white"
            />
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="bg-[#FFC80D] text-[#09392D] px-4 py-2 rounded-2xl font-bold text-sm hover:bg-[#e6b40b] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Poster
            </button>
          </div>
        </div>
      </div>

      {/* Liste des posts */}
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 hover:bg-gray-50 transition">
            {/* Header du post */}
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={post.avatar} 
                alt={post.author}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-bold text-sm text-[#09392D]">{post.author}</h3>
                <p className="text-xs text-gray-500">{post.time}</p>
              </div>
            </div>

            {/* Contenu */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.content}</p>

            {/* Image si disponible */}
            {post.image && (
              <img 
                src={post.image}
                alt="Post"
                className="w-full rounded-xl mb-3 object-cover h-48"
              />
            )}

            {/* Engagement */}
            <div className="flex gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex-1 flex justify-around items-center">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 transition ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
                  <span className="text-xs font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-[#09392D] transition">
                  <MessageCircle size={16} />
                  <span className="text-xs font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-[#389038] transition">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
