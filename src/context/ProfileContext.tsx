import { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileContextType {
  profiles: string[];
  activeProfile: string | null;
  createProfile: (name: string) => void;
  switchProfile: (name: string) => void;
  deleteProfile: (name: string) => void;
  logout: () => void;
  getStorageKey: (base: string) => string;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('chidon-profiles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeProfile, setActiveProfile] = useState<string | null>(() => {
    return localStorage.getItem('chidon-active-profile') || null;
  });

  const migrateOldData = (profileName: string) => {
    // Migrate old pre-profile data if this profile has no real progress
    const profileKey = `chidon-progress-${profileName}`;
    const oldData = localStorage.getItem('chidon-progress');
    if (!oldData) return;
    try {
      const oldParsed = JSON.parse(oldData);
      const oldHasProgress = oldParsed.totalQuizzesTaken > 0 ||
        Object.keys(oldParsed.questionProgress || {}).length > 0 ||
        (oldParsed.coins || 0) > 0 ||
        (oldParsed.ownedCats || []).length > 0;
      if (!oldHasProgress) return;

      const existing = localStorage.getItem(profileKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        const hasProgress = parsed.totalQuizzesTaken > 0 ||
          Object.keys(parsed.questionProgress || {}).length > 0 ||
          (parsed.coins || 0) > 0 ||
          (parsed.ownedCats || []).length > 0;
        if (hasProgress) return; // Profile already has real data, don't overwrite
      }
      localStorage.setItem(profileKey, oldData);
    } catch {
      // ignore parse errors
    }
  };

  const createProfile = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // If profile already exists, just switch to it
    if (profiles.includes(trimmed)) {
      migrateOldData(trimmed);
      switchProfile(trimmed);
      return;
    }
    const updated = [...profiles, trimmed];
    setProfiles(updated);
    localStorage.setItem('chidon-profiles', JSON.stringify(updated));
    migrateOldData(trimmed);
    setActiveProfile(trimmed);
    localStorage.setItem('chidon-active-profile', trimmed);
  };

  const switchProfile = (name: string) => {
    setActiveProfile(name);
    localStorage.setItem('chidon-active-profile', name);
  };

  const deleteProfile = (name: string) => {
    const updated = profiles.filter(p => p !== name);
    setProfiles(updated);
    localStorage.setItem('chidon-profiles', JSON.stringify(updated));
    // Clean up this profile's data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(`-${name}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (activeProfile === name) {
      const next = updated[0] || null;
      setActiveProfile(next);
      if (next) {
        localStorage.setItem('chidon-active-profile', next);
      } else {
        localStorage.removeItem('chidon-active-profile');
      }
    }
  };

  const logout = () => {
    setActiveProfile(null);
    localStorage.removeItem('chidon-active-profile');
  };

  const getStorageKey = (base: string) => {
    return activeProfile ? `${base}-${activeProfile}` : base;
  };

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, createProfile, switchProfile, deleteProfile, logout, getStorageKey }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
