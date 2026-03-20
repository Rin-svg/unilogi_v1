import { Heart, MessageCircle, Share2, Search, Trash2, Send, Wifi, WifiOff, Users, Circle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constantes ───────────────────────────────────────────────────────────
const STORAGE_KEY  = 'unilogi_community_posts';
const PRESENCE_KEY = 'unilogi_presence';
const TYPING_KEY   = 'unilogi_typing';
const CHANNEL_NAME = 'unilogi_community';
const POLL_MS      = 2500;
const TYPING_DELAY = 1500;
const PRESENCE_TTL = 8000;

// ─── Lecture du profil courant (prend en compte les modifs du profil) ─────
const getCurrentUser = () => {
  try {
    const profile   = JSON.parse(localStorage.getItem('unilogi_profile') || 'null');
    const fromLogin = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id:     fromLogin.id   || fromLogin._id || 'local',
      name:   profile?.name  || fromLogin.name  || 'Moi',
      email:  profile?.email || fromLogin.email || '',
    };
  } catch {
    return { id: 'local', name: 'Moi', email: '' };
  }
};

const getCurrentAvatar = (name) => {
  const saved = localStorage.getItem('unilogi_avatar');
  return saved || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'User'}`;
};

// ─── localStorage helpers ────────────────────────────────────────────────
const loadLocalPosts = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
const saveLocalPosts = (p) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) { console.error(e); } };

const updatePresence = (user) => {
  try {
    const d = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
    d[user.id] = { name: user.name, ts: Date.now() };
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(d));
  } catch { /* ignore */ }
};
const getOnlineUsers = () => {
  try {
    const d = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
    return Object.values(d).filter((u) => Date.now() - u.ts < PRESENCE_TTL);
  } catch { return []; }
};
const setTypingStatus = (user, typing) => {
  try {
    const d = JSON.parse(localStorage.getItem(TYPING_KEY) || '{}');
    if (typing) d[user.id] = { name: user.name, ts: Date.now() };
    else delete d[user.id];
    localStorage.setItem(TYPING_KEY, JSON.stringify(d));
  } catch { /* ignore */ }
};
const getTypingUsers = (currentId) => {
  try {
    const d = JSON.parse(localStorage.getItem(TYPING_KEY) || '{}');
    return Object.entries(d)
      .filter(([k, v]) => k !== String(currentId) && Date.now() - v.ts < TYPING_DELAY + 500)
      .map(([, v]) => v.name);
  } catch { return []; }
};

// ─────────────────────────────────────────────────────────────────────────
const Community = () => {
  // Profil courant — relu à chaque rendu ET mis à jour sur événement
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [myAvatar,    setMyAvatar]    = useState(() => getCurrentAvatar(getCurrentUser().name));

  const [posts, setPosts]               = useState([]);
  const [newPost, setNewPost]           = useState('');
  const [loading, setLoading]           = useState(true);
  const [showComments, setShowComments] = useState({});
  const [comments,    setComments]      = useState({});
  const [newComment,  setNewComment]    = useState({});
  const [searchQuery, setSearchQuery]   = useState('');
  const [isOnline,    setIsOnline]      = useState(navigator.onLine);
  const [onlineUsers, setOnlineUsers]   = useState([]);
  const [typingUsers, setTypingUsers]   = useState([]);
  const [newMsgCount, setNewMsgCount]   = useState(0);

  const token        = localStorage.getItem('token');
  const API_URL      = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const channelRef   = useRef(null);
  const pollTimer    = useRef(null);
  const typingTimer  = useRef(null);
  const presenceTimer= useRef(null);
  const postsRef     = useRef(posts);
  const listBottom   = useRef(null);
  postsRef.current   = posts;

  // ── Écouter les mises à jour du profil ──────────────────────────────────
  useEffect(() => {
    const handleProfileUpdate = () => {
      const updated = getCurrentUser();
      setCurrentUser(updated);
      setMyAvatar(getCurrentAvatar(updated.name));
    };
    window.addEventListener('unilogi_profile_updated', handleProfileUpdate);
    // Écouter aussi les changements de storage depuis d'autres onglets
    window.addEventListener('storage', (e) => {
      if (e.key === 'unilogi_profile' || e.key === 'unilogi_avatar' || e.key === 'user') {
        handleProfileUpdate();
      }
    });
    return () => {
      window.removeEventListener('unilogi_profile_updated', handleProfileUpdate);
    };
  }, []);

  // ── Initialisation ──────────────────────────────────────────────────────
  useEffect(() => {
    const local = loadLocalPosts();
    if (local.length > 0) setPosts(local);
    setLoading(false);
    fetchPosts(true);

    pollTimer.current = setInterval(() => fetchPosts(false), POLL_MS);

    if ('BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (e) => {
        if (e.data.type === 'NEW_POST') {
          setPosts((prev) => {
            const ids = new Set(prev.map((p) => String(p.id)));
            if (ids.has(String(e.data.post.id))) return prev;
            const updated = [e.data.post, ...prev];
            saveLocalPosts(updated);
            return updated;
          });
        }
        if (e.data.type === 'DELETE_POST') {
          setPosts((prev) => {
            const updated = prev.filter((p) => String(p.id) !== String(e.data.postId));
            saveLocalPosts(updated);
            return updated;
          });
        }
      };
    }

    const user = getCurrentUser();
    updatePresence(user);
    presenceTimer.current = setInterval(() => {
      updatePresence(getCurrentUser());
      setOnlineUsers(getOnlineUsers());
      setTypingUsers(getTypingUsers(getCurrentUser().id));
    }, 2000);

    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      clearInterval(pollTimer.current);
      clearInterval(presenceTimer.current);
      clearTimeout(typingTimer.current);
      channelRef.current?.close();
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // ── Fetch API ─────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (initial = false) => {
    try {
      const res = await fetch(`${API_URL}/api/community/posts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal:  AbortSignal.timeout(4000),
      });
      if (!res.ok) return;
      const data = await res.json();
      const serverPosts = data.posts || [];

      setPosts((prev) => {
        const serverIds = new Set(serverPosts.map((p) => String(p.id)));
        const localOnly = prev.filter((p) => p._localOnly && !serverIds.has(String(p.id)));
        const merged    = [...localOnly, ...serverPosts];
        if (!initial && merged.length > postsRef.current.length) {
          setNewMsgCount((c) => c + (merged.length - postsRef.current.length));
        }
        saveLocalPosts(merged);
        return merged;
      });
    } catch { /* hors ligne */ }
  }, [API_URL, token]);

  const scrollToBottom = () => {
    listBottom.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMsgCount(0);
  };

  // ── Poster ────────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!newPost.trim()) return;
    const user   = getCurrentUser();
    const avatar = getCurrentAvatar(user.name);

    setTypingStatus(user, false);
    clearTimeout(typingTimer.current);

    const tempPost = {
      id:            `local_${Date.now()}`,
      content:       newPost,
      author_name:   user.name,
      author_avatar: avatar,
      userId:        user.id,
      createdAt:     new Date().toISOString(),
      like_count:    0,
      comment_count: 0,
      user_liked:    false,
      _localOnly:    true,
    };

    const updated = [tempPost, ...posts];
    setPosts(updated);
    saveLocalPosts(updated);
    setNewPost('');
    channelRef.current?.postMessage({ type: 'NEW_POST', post: tempPost });

    try {
      const res = await fetch(`${API_URL}/api/community/posts`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content: tempPost.content }),
        signal:  AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data   = await res.json();
        // Injecter le nom/avatar à jour dans la réponse serveur
        const synced = updated.map((p) =>
          p.id === tempPost.id
            ? { ...data.post, author_name: user.name, author_avatar: avatar, _localOnly: false }
            : p
        );
        setPosts(synced);
        saveLocalPosts(synced);
        channelRef.current?.postMessage({ type: 'NEW_POST', post: synced[0] });
      }
    } catch { /* local suffit */ }
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleNewPostChange = (e) => {
    setNewPost(e.target.value);
    const user = getCurrentUser();
    if (e.target.value.trim()) {
      setTypingStatus(user, true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingStatus(user, false), TYPING_DELAY);
    } else {
      setTypingStatus(user, false);
    }
  };

  // ── Like ──────────────────────────────────────────────────────────────────
  const handleLike = async (postId) => {
    const updated = posts.map((p) =>
      p.id === postId
        ? { ...p, user_liked: !p.user_liked, like_count: p.user_liked ? p.like_count - 1 : p.like_count + 1 }
        : p
    );
    setPosts(updated); saveLocalPosts(updated);
    if (!String(postId).startsWith('local_')) {
      try { await fetch(`${API_URL}/api/community/posts/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }); } catch { /* ignore */ }
    }
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async (postId) => {
    if (!confirm('Supprimer ce post ?')) return;
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated); saveLocalPosts(updated);
    channelRef.current?.postMessage({ type: 'DELETE_POST', postId });
    if (!String(postId).startsWith('local_')) {
      try { await fetch(`${API_URL}/api/community/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }); } catch { /* ignore */ }
    }
  };

  // ── Commentaires ──────────────────────────────────────────────────────────
  const toggleComments = async (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId] && !String(postId).startsWith('local_')) {
      try {
        const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, { headers: { 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(5000) });
        if (res.ok) { const d = await res.json(); setComments((prev) => ({ ...prev, [postId]: d.comments })); }
      } catch { /* ignore */ }
    }
  };

  const handleComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;
    const user = getCurrentUser();
    const temp = { id: `local_c_${Date.now()}`, content: newComment[postId], author_name: user.name, createdAt: new Date().toISOString() };
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), temp] }));
    const up = posts.map((p) => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p);
    setPosts(up); saveLocalPosts(up);
    setNewComment((prev) => ({ ...prev, [postId]: '' }));
    if (!String(postId).startsWith('local_')) {
      try {
        const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: temp.content }), signal: AbortSignal.timeout(5000) });
        if (res.ok) { const d = await res.json(); setComments((prev) => ({ ...prev, [postId]: (prev[postId] || []).map((c) => c.id === temp.id ? d.comment : c) })); }
      } catch { /* ignore */ }
    }
  };

  // ── Formatage date ────────────────────────────────────────────────────────
  const formatTime = (ts) => {
    const d = new Date(ts), now = new Date(), ms = now - d;
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), j = Math.floor(ms / 86400000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m}min`;
    if (h < 24) return `Il y a ${h}h`;
    if (j < 7)  return `Il y a ${j}j`;
    return d.toLocaleDateString('fr-FR');
  };

  const filteredPosts = posts.filter((p) =>
    !searchQuery.trim() ||
    p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-24">

      {/* Header */}
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Communauté</h2>
          <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {isOnline ? <><Wifi size={12}/> En ligne</> : <><WifiOff size={12}/> Hors ligne</>}
          </div>
        </div>

        {/* Utilisateurs en ligne */}
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <Users size={13} className="text-green-400 flex-shrink-0" />
            {onlineUsers.slice(0, 5).map((u, i) => (
              <span key={i} className="flex items-center gap-0.5 text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                <Circle size={6} className="text-green-400 fill-green-400" /> {u.name}
              </span>
            ))}
            {onlineUsers.length > 5 && <span className="text-[11px] text-gray-400">+{onlineUsers.length - 5}</span>}
          </div>
        )}

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des posts..."
            className="w-full bg-white/15 border border-white/25 pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#FFC80D] text-sm" />
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="bg-white px-4 pt-3 pb-2 border-b sticky top-0 z-40 shadow-sm">
        <div className="flex gap-3 items-end">
          {/* Avatar mis à jour depuis le profil */}
          <img src={myAvatar} alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-[#FFC80D]" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-bold text-[#09392D] ml-1">{currentUser.name}</span>
            <div className="flex gap-2">
              <textarea rows={1} value={newPost} onChange={handleNewPostChange}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
                placeholder="Partagez votre expérience..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFC80D] resize-none"
                style={{ minHeight: '40px', maxHeight: '100px' }} />
              <button onClick={handlePost} disabled={!newPost.trim()}
                className="bg-[#FFC80D] text-[#09392D] px-4 py-2 rounded-2xl font-bold text-sm hover:bg-[#e6b40b] disabled:opacity-40 transition shadow-md self-end">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Indicateur de frappe */}
        {typingUsers.length > 0 && (
          <div className="mt-1.5 ml-12 flex items-center gap-1.5 text-xs text-gray-400">
            <span className="flex gap-0.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
            <span className="italic">
              {typingUsers.slice(0, 2).join(' et ')}{typingUsers.length > 2 ? ` et ${typingUsers.length - 2} autre(s)` : ''} écri{typingUsers.length > 1 ? 'vent' : 't'}...
            </span>
          </div>
        )}

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
            {isOnline ? 'Temps réel activé · mise à jour auto' : 'Mode hors ligne · messages sauvegardés'}
          </div>
          <span className="text-[10px] text-gray-400">{posts.length} message{posts.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Badge nouveaux messages */}
      {newMsgCount > 0 && (
        <button onClick={scrollToBottom}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-[#09392D] text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          ↓ {newMsgCount} nouveau{newMsgCount > 1 ? 'x' : ''} message{newMsgCount > 1 ? 's' : ''}
        </button>
      )}

      {loading && posts.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-[#09392D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Connexion à la communauté...
        </div>
      )}

      {/* Liste des posts */}
      <div className="divide-y">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white p-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  // Si c'est un post de l'utilisateur courant → utiliser son avatar à jour
                  (post.userId === currentUser.id || String(post.id).startsWith('local_'))
                    ? myAvatar
                    : (post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`)
                }
                alt={post.author_name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#09392D]">
                    {/* Afficher le nom à jour si c'est l'utilisateur courant */}
                    {(post.userId === currentUser.id || String(post.id).startsWith('local_'))
                      ? currentUser.name
                      : post.author_name}
                  </h3>
                  {onlineUsers.some((u) => u.name === post.author_name) && (
                    <Circle size={7} className="text-green-400 fill-green-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
              </div>

              {post._localOnly && (
                <span className="text-[10px] text-orange-400 font-bold bg-orange-50 px-2 py-0.5 rounded-full">Local</span>
              )}
              {(post.userId === currentUser.id || String(post.id).startsWith('local_')) && (
                <button onClick={() => handleDelete(post.id)} className="text-gray-300 hover:text-red-500 transition">
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-xl mb-3 h-48 object-cover" />}

            <div className="flex gap-4 pt-2 border-t border-gray-50">
              <button onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 transition ${post.user_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                <Heart size={16} fill={post.user_liked ? 'currentColor' : 'none'} />
                <span className="text-xs font-semibold">{post.like_count || 0}</span>
              </button>
              <button onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-[#09392D] transition">
                <MessageCircle size={16} />
                <span className="text-xs font-semibold">{post.comment_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#389038] transition ml-auto">
                <Share2 size={16} />
              </button>
            </div>

            {showComments[post.id] && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="space-y-2.5 mb-3 max-h-56 overflow-y-auto">
                  {(comments[post.id] || []).map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_name}`} alt={c.author_name} className="w-7 h-7 rounded-full flex-shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                        <p className="font-bold text-xs text-[#09392D]">{c.author_name}</p>
                        <p className="text-xs text-gray-700 mt-0.5">{c.content}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#FFC80D]" />
                  <button onClick={() => handleComment(post.id)} disabled={!newComment[post.id]?.trim()}
                    className="bg-[#09392D] text-white p-2 rounded-full hover:bg-[#389038] disabled:opacity-40 transition">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={listBottom} />
      </div>

      {!loading && filteredPosts.length === 0 && (
        <div className="p-10 text-center text-gray-400">
          {searchQuery ? <p>Aucun post pour "{searchQuery}"</p> : (
            <><MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500 mb-1">Aucun message pour le moment</p>
              <p className="text-sm">Soyez le premier à partager !</p></>
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
