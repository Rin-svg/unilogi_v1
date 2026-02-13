import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Eye, EyeOff, Lock, Bell, MapPin, Users, 
  Trash2, Download, ChevronRight, AlertCircle, Check
} from 'lucide-react';
import config from '../config';

export default function Privacy() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    allowNotifications: true,
    shareActivityStatus: true,
    allowLocationTracking: false,
    dataAnalytics: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDataDownload, setShowDataDownload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/api/privacy-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/api/privacy-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const downloadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/api/download-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mes-donnees-unilogi-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setShowDataDownload(false);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/api/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Confidentialité & Sécurité
        </h1>
        <p className="text-indigo-100 text-sm">
          Gérez vos données et votre confidentialité
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Visibility */}
        <section className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Visibilité du profil</h2>
          </div>

          <div className="space-y-3">
            {[
              { value: 'public', label: 'Public', desc: 'Tout le monde peut voir votre profil' },
              { value: 'friends', label: 'Amis uniquement', desc: 'Seuls vos contacts peuvent voir' },
              { value: 'private', label: 'Privé', desc: 'Profil masqué pour tous' }
            ].map(({ value, label, desc }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  settings.profileVisibility === value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={settings.profileVisibility === value}
                  onChange={() => updateSetting('profileVisibility', value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Personal Information */}
        <section className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Afficher mon email</div>
                <div className="text-sm text-gray-500">Visible sur votre profil</div>
              </div>
              <ToggleSwitch
                checked={settings.showEmail}
                onChange={(val) => updateSetting('showEmail', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Afficher mon téléphone</div>
                <div className="text-sm text-gray-500">Visible sur votre profil</div>
              </div>
              <ToggleSwitch
                checked={settings.showPhone}
                onChange={(val) => updateSetting('showPhone', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Afficher ma localisation</div>
                <div className="text-sm text-gray-500">Ville ou région</div>
              </div>
              <ToggleSwitch
                checked={settings.showLocation}
                onChange={(val) => updateSetting('showLocation', val)}
              />
            </div>
          </div>
        </section>

        {/* Communications */}
        <section className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Communications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Messages privés</div>
                <div className="text-sm text-gray-500">Recevoir des messages</div>
              </div>
              <ToggleSwitch
                checked={settings.allowMessages}
                onChange={(val) => updateSetting('allowMessages', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Notifications</div>
                <div className="text-sm text-gray-500">Alertes et mises à jour</div>
              </div>
              <ToggleSwitch
                checked={settings.allowNotifications}
                onChange={(val) => updateSetting('allowNotifications', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Statut d'activité</div>
                <div className="text-sm text-gray-500">Dernière connexion visible</div>
              </div>
              <ToggleSwitch
                checked={settings.shareActivityStatus}
                onChange={(val) => updateSetting('shareActivityStatus', val)}
              />
            </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Données et localisation</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Suivi de localisation</div>
                <div className="text-sm text-gray-500">Pour les recommandations</div>
              </div>
              <ToggleSwitch
                checked={settings.allowLocationTracking}
                onChange={(val) => updateSetting('allowLocationTracking', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Analyse des données</div>
                <div className="text-sm text-gray-500">Améliorer nos services</div>
              </div>
              <ToggleSwitch
                checked={settings.dataAnalytics}
                onChange={(val) => updateSetting('dataAnalytics', val)}
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Gestion des données</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowDataDownload(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Télécharger mes données</div>
                  <div className="text-sm text-gray-500">Export au format JSON</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-red-200 hover:border-red-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium text-red-900">Supprimer mon compte</div>
                  <div className="text-sm text-red-500">Action irréversible</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enregistrement...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Sauvegardé !
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </button>
      </div>

      {/* Download Data Modal */}
      {showDataDownload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Télécharger mes données</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Vous allez télécharger toutes vos données personnelles au format JSON. 
              Cela inclut votre profil, favoris, messages et activités.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDataDownload(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={downloadData}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700"
              >
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">Supprimer mon compte</h3>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-900 font-medium mb-2">⚠️ Action irréversible</p>
              <p className="text-red-700 text-sm">
                Toutes vos données seront définitivement supprimées : profil, favoris, 
                messages, et historique. Cette action ne peut pas être annulée.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
