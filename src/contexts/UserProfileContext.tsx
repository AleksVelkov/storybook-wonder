import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
  isProfileComplete: boolean;
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Nederland',
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const clearProfile = () => {
    setProfile(defaultProfile);
    localStorage.removeItem('userProfile');
  };

  const isProfileComplete = Boolean(
    profile.name &&
    profile.email &&
    profile.phone &&
    profile.address &&
    profile.city &&
    profile.postalCode
  );

  return (
    <UserProfileContext.Provider value={{
      profile,
      updateProfile,
      clearProfile,
      isProfileComplete,
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
