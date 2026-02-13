import { Upload, MapPin, Home, DollarSign, Users, Camera } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddApartment = () => {
  const navigate = useNavigate();
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
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFormData({
          ...formData,
          image: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Simuler l'envoi
    console.log('Logement ajouté:', formData);
    
    // Rediriger après succès
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-screen bg-gradient-to-b from-[#09392D] to-[#0d4d3a]">
        <div className="text-center text-white p-6">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Logement ajouté!</h2>
          <p className="text-gray-300 mb-6">Votre annonce a été publiée avec succès.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#FFC80D] text-[#09392D] px-8 py-3 rounded-xl font-bold hover:bg-[#e6b40b] transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#09392D] to-[#0d4d3a] text-white p-6 pb-8">
        <h2 className="text-2xl font-bold">Ajouter un logement</h2>
        <p className="text-gray-300 text-sm mt-2">Remplissez les détails de votre logement</p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
        
        {/* Upload Image */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#FFC80D] transition">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-3" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData({ ...formData, image: '' });
                }}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold"
              >
                Retirer
              </button>
            </div>
          ) : (
            <>
              <Camera size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium mb-2">Ajouter une photo</p>
              <p className="text-xs text-gray-500 mb-4">JPG, PNG jusqu'à 10MB</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
          />
          <label className="cursor-pointer block">
            <span className="bg-[#FFC80D] text-[#09392D] px-4 py-2 rounded-lg font-bold inline-block">
              Choisir une image
            </span>
          </label>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-bold text-[#09392D] mb-2">
            Titre du logement *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ex: Studio moderne près de l'Université"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none"
          />
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-bold text-[#09392D] mb-2 flex items-center gap-2">
            <MapPin size={16} /> Localisation *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Ex: Molyko, Buea"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none"
          />
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-2 gap-4">
          {/* Prix */}
          <div>
            <label className="block text-sm font-bold text-[#09392D] mb-2 flex items-center gap-2">
              <DollarSign size={16} /> Prix/mois *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Ex: 50000"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none"
            />
          </div>

          {/* Chambres */}
          <div>
            <label className="block text-sm font-bold text-[#09392D] mb-2 flex items-center gap-2">
              <Users size={16} /> Chambres *
            </label>
            <select
              name="rooms"
              value={formData.rooms}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none"
            >
              <option value="">Sélectionner</option>
              <option value="1">1 chambre</option>
              <option value="2">2 chambres</option>
              <option value="3">3 chambres</option>
              <option value="4">4+ chambres</option>
            </select>
          </div>
        </div>

        {/* Surface */}
        <div>
          <label className="block text-sm font-bold text-[#09392D] mb-2">
            Surface (m²) *
          </label>
          <input
            type="number"
            name="surface"
            value={formData.surface}
            onChange={handleInputChange}
            placeholder="Ex: 40"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[#09392D] mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Décrivez votre logement en détail..."
            required
            rows="5"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-bold text-[#09392D] mb-2">
            Téléphone de contact *
          </label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="Ex: +237 6XX XXX XXX"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none"
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-400 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#FFC80D] text-[#09392D] py-3 rounded-xl font-bold hover:bg-[#e6b40b] transition flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            Publier le logement
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddApartment;
