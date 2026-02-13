import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('unilogi_users') || '[]'); }
  catch { return []; }
};

const saveUsers = (users) => localStorage.setItem('unilogi_users', JSON.stringify(users));

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'unilogi_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateToken = (userId) => btoa(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', confirmPassword: '' });

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        if (!formData.email || !formData.password) throw new Error('Veuillez remplir tous les champs');
        const users = getUsers();
        const hashedPwd = await hashPassword(formData.password);
        const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === hashedPwd);
        if (!user) throw new Error('Email ou mot de passe incorrect');
        const token = generateToken(user.id);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
        navigate('/home', { replace: true });
      } else {
        if (!formData.name || formData.name.trim().length < 2) throw new Error('Le nom doit contenir au moins 2 caractères');
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error('Adresse email invalide');
        if (!formData.password || formData.password.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        if (formData.password !== formData.confirmPassword) throw new Error('Les mots de passe ne correspondent pas');
        const users = getUsers();
        if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) throw new Error('Cet email est déjà utilisé');
        const hashedPwd = await hashPassword(formData.password);
        const newUser = { id: Date.now().toString(), name: formData.name.trim(), email: formData.email.toLowerCase(), password: hashedPwd, createdAt: new Date().toISOString() };
        users.push(newUser);
        saveUsers(users);
        setRegistrationSuccess(true);
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#09392D] to-[#389038] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#389038]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#09392D] mb-4">Compte créé avec succès !</h2>
          <p className="text-gray-600 mb-6">Bienvenue <strong>{formData.name}</strong> sur UniLogi ! Vous pouvez maintenant vous connecter.</p>
          <button onClick={() => { setRegistrationSuccess(false); setIsLogin(true); setFormData({ email: formData.email, password: '', name: '', confirmPassword: '' }); }}
            className="w-full bg-[#09392D] text-white py-3 rounded-xl font-bold hover:bg-[#0d4d3a] transition">
            Se connecter maintenant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09392D] to-[#389038] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFC80D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-[#09392D] font-black text-xl">UL</span>
          </div>
          <h1 className="text-3xl font-bold text-[#09392D] mb-2">{isLogin ? 'Bienvenue !' : 'Créer un compte'}</h1>
          <p className="text-gray-500 text-sm">{isLogin ? 'Connectez-vous à UniLogi' : 'Rejoignez UniLogi dès maintenant'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none transition"
                  placeholder="Votre nom complet" required={!isLogin} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none transition"
                placeholder="votre.email@example.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl pl-11 pr-12 py-3 focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none transition"
                placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#FFC80D] focus:border-transparent outline-none transition"
                  placeholder="••••••••" required={!isLogin} />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#FFC80D] text-[#09392D] py-3 rounded-xl font-bold hover:bg-[#e6b40b] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({ email: '', password: '', name: '', confirmPassword: '' }); }}
              className="text-[#389038] font-bold hover:underline">
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="mt-3 text-center">
            <button type="button" onClick={() => setError('Contactez le support UniLogi pour réinitialiser votre mot de passe.')}
              className="text-xs text-gray-400 hover:text-[#389038] hover:underline">
              Mot de passe oublié ?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
