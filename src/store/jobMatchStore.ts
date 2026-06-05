import { create } from 'zustand';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface JobMatchDocument {
  id: string;
  userId: string;
  resumeId: string;
  resumeTitle: string;
  jobTitle: string;
  companyName: string;
  jobDescriptionSource: 'paste' | 'pdf';
  jobDescriptionText: string;
  // Analysis results
  matchPercentage: number;
  missingKeywords: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  suggestions: string[];
  overallFeedback: string;
  createdAt: string;
}

interface JobMatchState {
  jobMatches: JobMatchDocument[];
  loading: boolean;
  error: string | null;

  fetchJobMatches: (userId: string) => Promise<void>;
  saveJobMatch: (
    match: Omit<JobMatchDocument, 'id' | 'createdAt'>
  ) => Promise<JobMatchDocument>;
  deleteJobMatch: (matchId: string) => Promise<void>;
}

export const useJobMatchStore = create<JobMatchState>((set, get) => ({
  jobMatches: [],
  loading: false,
  error: null,

  fetchJobMatches: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'jobMatches'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as JobMatchDocument));
      set({ jobMatches: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  saveJobMatch: async (match) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const docData = { ...match, createdAt: now };
      const docRef = await addDoc(collection(db, 'jobMatches'), docData);
      const created: JobMatchDocument = { id: docRef.id, ...docData };

      set({ jobMatches: [created, ...get().jobMatches], loading: false });

      // Activity log
      await addDoc(collection(db, 'activityLogs'), {
        userId: match.userId,
        type: 'JOB_MATCH',
        description: `Job match analysis: ${match.matchPercentage}% for "${match.jobTitle}"`,
        targetId: docRef.id,
        createdAt: now,
      });

      // Increment user stats
      const userRef = doc(db, 'users', match.userId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (snap.exists()) {
          const stats = snap.data().stats || {};
          tx.update(userRef, {
            'stats.jobMatchCount': (stats.jobMatchCount || 0) + 1,
            updatedAt: now,
          });
        }
      });

      return created;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteJobMatch: async (matchId) => {
    try {
      await deleteDoc(doc(db, 'jobMatches', matchId));
      set({ jobMatches: get().jobMatches.filter(m => m.id !== matchId) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
