import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;
  professionalTitle: string;
  yearsOfExperience: number;
  skills: string[];
  profilePhoto: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
}

export interface UserStats {
  resumeCount: number;
  atsAnalysisCount: number;
  jobMatchCount: number;
  applicationsCount: number;
  interviewsCount: number;
  certificatesCount: number;
}

export interface OnboardingStatus {
  completed: boolean;
  step: 'profile' | 'resume-import' | 'done';
  completedAt: string | null;
}

export interface UserDocumentData {
  profile: UserProfile;
  settings: UserSettings;
  stats: UserStats;
  onboardingStatus: OnboardingStatus;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  stats: UserStats | null;
  onboarding: OnboardingStatus | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  
  // Auth Operations
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  
  // Profile & Settings Operations
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updateSettings: (settingsData: Partial<UserSettings>) => Promise<void>;
  setOnboardingStep: (step: OnboardingStatus['step'], completed?: boolean) => Promise<void>;
  refreshStats: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

// Initial state helpers
const defaultProfile = (email: string, fullName: string = ''): UserProfile => ({
  fullName: fullName,
  email: email,
  phone: '',
  location: '',
  linkedIn: '',
  gitHub: '',
  portfolio: '',
  professionalTitle: '',
  yearsOfExperience: 0,
  skills: [],
  profilePhoto: '',
});

const defaultSettings: UserSettings = {
  theme: 'light',
  emailNotifications: true,
};

const defaultStats: UserStats = {
  resumeCount: 0,
  atsAnalysisCount: 0,
  jobMatchCount: 0,
  applicationsCount: 0,
  interviewsCount: 0,
  certificatesCount: 0,
};

const defaultOnboarding: OnboardingStatus = {
  completed: false,
  step: 'profile',
  completedAt: null,
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Setup standard listener for state modifications
  onAuthStateChanged(auth, async (firebaseUser) => {
    set({ initialized: true });
    if (firebaseUser) {
      set({ user: firebaseUser, loading: true });
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserDocumentData;
          set({
            profile: data.profile,
            settings: data.settings,
            stats: data.stats,
            onboarding: data.onboardingStatus,
            loading: false,
          });
        } else {
          // Create document if missing (e.g. google login first time)
          const newDoc: UserDocumentData = {
            profile: defaultProfile(firebaseUser.email || '', firebaseUser.displayName || ''),
            settings: defaultSettings,
            stats: defaultStats,
            onboardingStatus: defaultOnboarding,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newDoc);
          set({
            profile: newDoc.profile,
            settings: newDoc.settings,
            stats: newDoc.stats,
            onboarding: newDoc.onboardingStatus,
            loading: false,
          });
        }
      } catch (err: any) {
        console.error('Error synchronizing firestore user profile:', err);
        set({ error: err.message, loading: false });
      }
    } else {
      set({
        user: null,
        profile: null,
        settings: null,
        stats: null,
        onboarding: null,
        loading: false,
      });
    }
  });

  return {
    user: null,
    profile: null,
    settings: null,
    stats: null,
    onboarding: null,
    loading: false,
    initialized: false,
    error: null,

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    register: async (email, password, fullName) => {
      set({ loading: true, error: null });
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Pre-create user profile details
        const userDocRef = doc(db, 'users', userCred.user.uid);
        const newDoc: UserDocumentData = {
          profile: defaultProfile(email, fullName),
          settings: defaultSettings,
          stats: defaultStats,
          onboardingStatus: defaultOnboarding,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newDoc);
        
        // Try sending verification email right away
        try {
          await sendEmailVerification(userCred.user);
        } catch (e) {
          console.warn('Verification email send failed:', e);
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    loginWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    logout: async () => {
      set({ loading: true });
      await signOut(auth);
      set({ user: null, profile: null, settings: null, stats: null, onboarding: null, loading: false });
    },

    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },

    verifyEmail: async () => {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    },

    reloadUser: async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        set({ user: auth.currentUser });
      }
    },

    updateProfile: async (profileData) => {
      const { user, profile } = get();
      if (!user || !profile) return;
      const updatedProfile = { ...profile, ...profileData };
      
      //set({ loading: true });
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          profile: updatedProfile,
          updatedAt: new Date().toISOString(),
        });
        set({ profile: updatedProfile, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    updateSettings: async (settingsData) => {
      const { user, settings } = get();
      if (!user || !settings) return;
      const updatedSettings = { ...settings, ...settingsData };
      
      set({ loading: true });
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          settings: updatedSettings,
          updatedAt: new Date().toISOString(),
        });
        set({ settings: updatedSettings, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    setOnboardingStep: async (step, completed = false) => {
      const { user, onboarding } = get();
      console.log('USER =', user);
console.log('ONBOARDING =', onboarding);
console.log('STEP PARAM =', step);
console.log('COMPLETED PARAM =', completed);



      if (!user || !onboarding) {
  console.log('EXITING EARLY');
  return;
}
      const updatedOnboarding = {
        completed,
        step,
        completedAt: completed ? new Date().toISOString() : onboarding.completedAt,
      };
      console.log('UPDATING TO =', updatedOnboarding);

      set({ loading: true });
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          onboardingStatus: updatedOnboarding,
          updatedAt: new Date().toISOString(),
        });
        set({ onboarding: updatedOnboarding, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    refreshStats: async () => {
      const { user } = get();
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data() as UserDocumentData;
          set({ stats: data.stats });
        }
      } catch (err) {
        console.error('Error refreshing statistics:', err);
      }
    },
  };
});
