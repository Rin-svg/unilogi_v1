import { Upload, MapPin, DollarSign, Camera, X, Home as HomeIcon, Phone, BedDouble, Maximize2, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── helpers localStorage ──────────────────────────────────────────────────
const APARTMENTS_KEY = 'unilogi_apartments';
const MY_APARTMENTS_KEY = 'unilogi_my_apartments';

const loadApartments = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const saveApartment = (apartment) => {
  // 1. Ajouter à la liste globale
  const all = loadApartments(APARTMENTS_KEY);
  const updated = [apartment, ...all];
  localStorage.setItem(APARTMENTS_KEY, JSON.stringify(updated));

  // 2. Ajouter à mes annonces
  const mine = loadApartments(MY_APARTMENTS_KEY);
  localStorage.setItem(MY_APARTMENTS_KEY, JSON.stringify([apartment, ...mine]));
};

// ─── Validation téléphone camerounais ──────────────────────────────────────
// Formats acceptés: 6XXXXXXXX  |  +2376XXXXXXXX  |  0016XXXXXXXX
const validatePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return /^(\+237|00237)?6[5-9]\d{7}$/.test(cleaned) ||
         /^(\+237|00237)?6[2-4]\d{7}$/.test(cleaned);
};

const formatPhoneCM = (raw) => {
  const cleaned = raw.replace(/[\s\-().]/g, '');
  if (/^6\d{8}$/.test(cleaned)) return `+237 ${cleaned}`;
  return raw;
};

// ─────────────────────────────────────────────────────────────────────────
const AddApartment = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    rooms: '',
    surface: '',
    description: '',
    contact: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'contact') setPhoneError('');
  };

  const handlePhoneBlur = () => {
    if (formData.contact && !validatePhone(formData.contact)) {
      setPhoneError('Numéro invalide. Format attendu : 6XX XXX XXX ou +237 6XX XXX XXX');
    } else {
      setPhoneError('');
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop grande (max 5 MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setFormData((prev) => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
    // Réinitialiser l'input pour permettre de rechoisir le même fichier
    e.target.value = '';
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  // ── Annuler ──────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setFormData({ title: '', location: '', price: '', rooms: '', surface: '', description: '', contact: '', image: '' });
    setImagePreview(null);
    setError('');
    setPhoneError('');
    navigate(-1);
  };

  // ── Valider & Publier ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError('Le titre est requis'); return; }
    if (!formData.location.trim()) { setError('La localisation est requise'); return; }
    if (!formData.price || Number(formData.price) <= 0) { setError('Le prix doit être supérieur à 0'); return; }
    if (!formData.contact.trim()) { setError('Le numéro de téléphone est requis'); return; }
    if (!validatePhone(formData.contact)) {
      setError('Numéro de téléphone invalide (format camerounais requis)');
      setPhoneError('Format attendu : 6XX XXX XXX ou +237 6XX XXX XXX');
      return;
    }

    setLoading(true);

    const apartment = {
      id: `local_${Date.now()}`,
      ...formData,
      price: Number(formData.price),
      contact: formatPhoneCM(formData.contact),
      status: 'disponible',
      isCertified: false,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      author_name: currentUser.name,
      _localOnly: true,
    };

    // ① Sauvegarde locale (permanente, immédiate)
    saveApartment(apartment);

    // ② Tentative de sync avec le serveur
    try {
      const response = await fetch(`${API_URL}/api/apartments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const data = await response.json();
        // Remplacer l'entrée locale par celle du serveur
        const all = loadApartments(APARTMENTS_KEY).map((a) =>
          a.id === apartment.id ? { ...data.apartment, _localOnly: false } : a
        );
        localStorage.setItem(APARTMENTS_KEY, JSON.stringify(all));

        const mine = loadApartments(MY_APARTMENTS_KEY).map((a) =>
          a.id === apartment.id ? { ...data.apartment, _localOnly: false } : a
        );
        localStorage.setItem(MY_APARTMENTS_KEY, JSON.stringify(mine));
      }
    } catch {
      // Pas de réseau : l'annonce locale est déjà enregistrée
    }

    setSubmitted(true);
    setLoading(false);
  };

  // ── Écran de confirmation ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-screen bg-gradient-to-b from-[#09392D] to-[#0d4d3a]">
        <div className="text-center text-white p-6">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Logement publié !</h2>
          <p className="text-gray-300 mb-6">Votre annonce est visible à l'accueil et dans "Mes Annonces".</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/home')}
              className="bg-[#FFC80D] text-[#09392D] px-6 py-3 rounded-xl font-bold hover:bg-[#e6b40b] transition"
            >
              Voir à l'accueil
            </button>
            <button
              onClick={() => navigate('/my-listings')}
              className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition"
            >
              Mes Annonces
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulaire ───────────────────────────────────────────────────────────
  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6 pb-8">
        <h2 className="text-2xl font-bold">Publier un logement</h2>
        <p className="text-gray-300 text-sm mt-2">Remplissez tous les champs pour publier</p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mt-4 px-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-bold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">

        {/* ─── IMAGE ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 bg-[#09392D] text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Camera size={20} />
              Photo du logement
            </h3>
          </div>
          <div className="p-6">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Aperçu" className="w-full h-64 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div
                onClick={handleImageClick}
                className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#FFC80D] transition bg-gray-50 cursor-pointer"
              >
                <Camera size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-bold mb-2">Choisir une image</p>
                <p className="text-xs text-gray-500">JPG, PNG jusqu'à 5 MB</p>
              </div>
            )}
            {/* Input caché – déclenché uniquement par handleImageClick */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* ─── TITRE ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-bold text-[#09392D] mb-3 flex items-center gap-2">
            <HomeIcon size={18} />
            Titre du logement *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ex: Studio moderne près de l'Université"
            required
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FFC80D] focus:border-[#FFC80D] outline-none"
          />
        </div>

        {/* ─── LOCALISATION ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-bold text-[#09392D] mb-3 flex items-center gap-2">
            <MapPin size={18} />
            Localisation *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Ex: Molyko, Buea"
            required
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FFC80D] outline-none"
          />
        </div>

        {/* ─── PRIX ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-bold text-[#09392D] mb-3 flex items-center gap-2">
            <DollarSign size={18} />
            Prix mensuel (FCFA) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Ex: 50000"
              required
              min="1"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pr-20 focus:ring-2 focus:ring-[#FFC80D] outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
              FCFA
            </span>
          </div>
        </div>

        {/* ─── CHAMBRES + SURFACE ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h3 className="font-bold text-[#09392D]">Caractéristiques</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Nombre de chambres : input numérique libre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <BedDouble size={16} />
                Nb de chambres
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                placeholder="Ex: 2"
                min="0"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FFC80D] outline-none"
              />
            </div>

            {/* Surface */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Maximize2 size={16} />
                Surface (m²)
              </label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleInputChange}
                placeholder="Ex: 40"
                min="1"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FFC80D] outline-none"
              />
            </div>
          </div>
        </div>

        {/* ─── DESCRIPTION ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-bold text-[#09392D] mb-3 flex items-center gap-2">
            <FileText size={18} />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Décrivez votre logement (état, équipements, proximités...)"
            rows="4"
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FFC80D] outline-none resize-none"
          />
        </div>

        {/* ─── TÉLÉPHONE ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-bold text-[#09392D] mb-3 flex items-center gap-2">
            <Phone size={18} />
            Téléphone *
          </label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            onBlur={handlePhoneBlur}
            placeholder="+237 6XX XXX XXX"
            required
            className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FFC80D] outline-none ${
              phoneError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {phoneError && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              ⚠ {phoneError}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">Formats valides : 6XX XXX XXX ou +237 6XX XXX XXX</p>
        </div>

        {/* ─── BOUTONS ─────────────────────────────────────────────────── */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-400 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-500 transition shadow-lg"
          >
            ❌ Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !!phoneError}
            className="flex-1 bg-gradient-to-r from-[#FFC80D] to-[#e6b40b] text-[#09392D] py-4 rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              '⏳ Publication...'
            ) : (
              <>
                <Upload size={24} />
                Publier le logement
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">* Champs obligatoires</p>
      </form>
    </div>
  );
};

export default AddApartment;
