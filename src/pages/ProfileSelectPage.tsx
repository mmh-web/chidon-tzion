import { useState } from 'react';
import { useProfile } from '../context/ProfileContext';

export function ProfileSelectPage() {
  const { profiles, createProfile, switchProfile, deleteProfile } = useProfile();
  const [newName, setNewName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createProfile(trimmed);
    setNewName('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #dbeafe 50%, #eef2ff 100%)' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-6xl block mb-3">🇮🇱</span>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">חידון ציון</h1>
          <p className="text-gray-500 text-sm">Chidon Tzion</p>
        </div>

        {/* Existing profiles */}
        {profiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-600 text-center">Choose your profile:</p>
            {profiles.map(name => (
              <div key={name} className="flex items-center gap-2">
                <button
                  onClick={() => switchProfile(name)}
                  className="flex-1 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 text-gray-800 py-3 px-4 rounded-xl font-bold text-lg transition-all cursor-pointer flex items-center gap-3"
                >
                  <span className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-xl">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  {name}
                </button>
                {confirmDelete === name ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { deleteProfile(name); setConfirmDelete(null); }}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold border-none cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-bold border-none cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(name)}
                    className="text-red-300 hover:text-red-500 bg-transparent border-none cursor-pointer text-lg"
                    title="Delete profile"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {profiles.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-400 text-sm">or create new</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        )}

        {/* Create new profile */}
        <div className="space-y-3">
          {profiles.length === 0 && (
            <p className="text-sm text-gray-600 text-center">Create a profile to save your progress!</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Enter your name..."
              maxLength={20}
              className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-lg outline-none transition-colors"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-bold text-lg transition-colors border-none cursor-pointer disabled:cursor-not-allowed"
            >
              Go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
