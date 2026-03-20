import { Mail, Phone, MapPin, Edit2, LogOut, Heart, Home, Settings, Shield, Navigation, School, Camera, Check, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Clés localStorage ──────────────────────────────────────────────────────
const AVATAR_KEY  = 'unilogi_avatar';
const PROFILE_KEY = 'unilogi_profile';   // profil édité par l'utilisateur

// ── Helpers ────────────────────────────────────────────────────────────────
const loadProfile = () => {
  try {
    // Priorité : profil édité > données du login
    const edited  = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    const fromLogin = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      name:     edited?.name     ?? fromLogin.name     ?? 'Utilisateur',
      email:    edited?.email    ?? fromLogin.email    ?? '',
      phone:    edited?.phone    ?? '+237 6XX XXX XXX',
      location: edited?.location ?? 'Yaoundé, Cameroun',
      bio:      edited?.bio      ?? 'Étudiant | Cherche un logement confortable',
      joinDate: edited?.joinDate ?? fromLogin.joinDate ?? 'Janvier 2024',
      verified: edited?.verified ?? fromLogin.emailVerified ?? true,
    };
  } catch {
    return { name: 'Utilisateur', email: '', phone: '', location: '', bio: '', joinDate: 'Janvier 2024', verified: false };
  }
};

const saveProfile = (profile) => {
  // 1. Sauvegarder dans la clé dédiée
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  // 2. Mettre aussi à jour la clé 'user' pour que tout le reste de l'app soit synchronisé
  try {
    const fromLogin = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...fromLogin, name: profile.name, email: profile.email }));
  } catch { /* ignore */ }
  // 3. Déclencher un événement storage pour que les autres composants ouverts se mettent à jour
  window.dispatchEvent(new Event('unilogi_profile_updated'));
};

// ─────────────────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const savedAvatar   = localStorage.getItem(AVATAR_KEY);
  const initialProfile = loadProfile();
  const defaultAvatar  = `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialProfile.name}`;

  const [profile, setProfile]         = useState(initialProfile);
  const [isEditing, setIsEditing]     = useState(false);
  const [editData, setEditData]       = useState(initialProfile);
  const [avatar, setAvatar]           = useState(savedAvatar || defaultAvatar);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);

  // ── Changer la photo ──────────────────────────────────────────────────
  const handleAvatarClick  = () => fileRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("Image trop grande (max 3 Mo)."); return; }

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem(AVATAR_KEY, dataUrl);
      setAvatar(dataUrl);
      setAvatarLoading(false);
      window.dispatchEvent(new Event('unilogi_profile_updated'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Sauvegarder les modifications ─────────────────────────────────────
  const handleSave = () => {
    // Validation minimale
    if (!editData.name.trim()) { alert('Le nom ne peut pas être vide.'); return; }

    saveProfile(editData);
    setProfile(editData);
    setIsEditing(false);

    // Flash de confirmation
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCancelEdit = () => {
    setEditData(profile); // remettre les données actuelles
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const stats = [
    { label: 'Favoris', value: 12, icon: Heart },
    { label: 'Visites', value: 48, icon: Home },
    { label: 'Avis',    value: 5,  icon: Shield },
  ];

  return (
    <div className="pb-24 bg-gray-50">

      {/* ── Couverture ─────────────────────────────────────────────────── */}
      <div className="h-32 bg-gradient-to-r from-[#09392D] to-[#389038] relative">
        <div className="absolute -bottom-16 left-6">
          <div className="relative w-32 h-32">
            <img
              src={avatar}
              alt={profile.name}
              className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-gray-100"
            />
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 bg-[#FFC80D] text-[#09392D] w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:bg-[#e6b40b] active:scale-95 transition border-2 border-white"
              title="Changer la photo"
            >
              <Camera size={16} strokeWidth={2.5} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>
      </div>

      {/* ── Infos principales ──────────────────────────────────────────── */}
      <div className="px-6 pt-20 pb-6 bg-white border-b border-gray-100">

        {/* Flash succès */}
        {saveSuccess && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-bold">
            <Check size={16} /> Profil mis à jour avec succès !
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#09392D] flex items-center gap-2">
              {profile.name}
              {profile.verified && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">✓ Vérifié</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Membre depuis {profile.joinDate}</p>
          </div>

          {!isEditing && (
            <button
              onClick={() => { setEditData(profile); setIsEditing(true); }}
              className="bg-[#FFC80D] text-[#09392D] p-2.5 rounded-full shadow-md hover:bg-[#e6b40b] transition"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {/* ── Mode lecture ──────────────────────────────────────────────── */}
        {!isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-[#389038] flex-shrink-0" />
              <span className="text-gray-700">{profile.email || <span className="text-gray-400 italic">Email non renseigné</span>}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-[#389038] flex-shrink-0" />
              <span className="text-gray-700">{profile.phone || <span className="text-gray-400 italic">Téléphone non renseigné</span>}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-[#389038] flex-shrink-0" />
              <span className="text-gray-700">{profile.location || <span className="text-gray-400 italic">Localisation non renseignée</span>}</span>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 italic border-l-2 border-[#FFC80D] pl-3 mt-2">"{profile.bio}"</p>
            )}
          </div>
        ) : (
          /* ── Mode édition ────────────────────────────────────────────── */
          <div className="space-y-3">
            {/* Nom */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Nom complet *</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D] outline-none"
                placeholder="Votre nom"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D] outline-none"
                placeholder="votre@email.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Téléphone</label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D] outline-none"
                placeholder="+237 6XX XXX XXX"
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Localisation</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D] outline-none"
                placeholder="Votre ville, quartier"
              />
            </div>

            {/* Bio / Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Description / Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D] outline-none resize-none"
                placeholder="Présentez-vous en quelques mots..."
                rows={3}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#09392D] text-white py-3 rounded-xl font-bold hover:bg-[#0d4d3a] transition flex items-center justify-center gap-2"
              >
                <Check size={16} /> Sauvegarder
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <X size={16} /> Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Statistiques ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-100">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
              <Icon size={24} className="text-[#389038] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#09392D]">{stat.value}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Menu ───────────────────────────────────────────────────────── */}
      <div className="bg-white divide-y divide-gray-100">
        <button onClick={() => navigate('/favorites')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3"><Heart size={20} className="text-[#389038]" /><span className="font-medium text-gray-700">Mes Favoris</span></div>
          <span className="text-gray-400">→</span>
        </button>
        <button onClick={() => navigate('/my-listings')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3"><Home size={20} className="text-[#389038]" /><span className="font-medium text-gray-700">Mes Annonces</span></div>
          <span className="text-gray-400">→</span>
        </button>
        <button onClick={() => navigate('/schools')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3"><School size={20} className="text-[#389038]" /><span className="font-medium text-gray-700">Recherche d'écoles</span></div>
          <span className="text-gray-400">→</span>
        </button>
        <button onClick={() => navigate('/directions')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3"><Navigation size={20} className="text-[#389038]" /><span className="font-medium text-gray-700">Itinéraires</span></div>
          <span className="text-gray-400">→</span>
        </button>
        <button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3"><Settings size={20} className="text-[#389038]" /><span className="font-medium text-gray-700">Confidentialité & Sécurité</span></div>
          <span className="text-gray-400">→</span>
        </button>
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition">
          <div className="flex items-center gap-3"><LogOut size={20} className="text-red-500" /><span className="font-medium text-red-500">Déconnexion</span></div>
          <span className="text-gray-400">→</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
