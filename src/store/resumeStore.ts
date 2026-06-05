import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ResumeData } from '../templates/types';
import type { AtsAnalysisResult } from '../services/ai/atsAnalyzer';

export interface ResumeDocument extends ResumeData {
  id: string;
  userId: string;
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersionDocument {
  id: string;
  resumeId: string;
  userId: string;
  versionNumber: number;
  templateUsed: ResumeData['template'];
  atsScore: number | null;
  resumeSnapshot: Omit<ResumeDocument, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
  createdAt: string;
}

export interface ResumeAnalysisDocument extends AtsAnalysisResult {
  id: string;
  userId: string;
  resumeId: string;
  resumeVersionId: string;
  createdAt: string;
}

interface ResumeState {
  resumes: ResumeDocument[];
  activeResume: ResumeDocument | null;
  versions: ResumeVersionDocument[];
  analyses: ResumeAnalysisDocument[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Actions
  fetchResumes: (userId: string) => Promise<void>;
  fetchVersions: (resumeId: string) => Promise<void>;
  fetchAnalyses: (resumeId: string) => Promise<void>;
  createResume: (userId: string, title: string, template?: ResumeData['template'], initialData?: Partial<ResumeData>) => Promise<ResumeDocument>;
  updateResume: (resumeId: string, updates: Partial<ResumeDocument>) => Promise<void>;
  duplicateResume: (resumeId: string) => Promise<void>;
  deleteResume: (resumeId: string) => Promise<void>;
  
  // Versioning
  createVersionSnapshot: (resumeId: string, note?: string) => Promise<ResumeVersionDocument>;
  restoreVersion: (resumeId: string, versionId: string) => Promise<void>;
  
  // ATS Analysis Caching
  saveAtsAnalysis: (resumeId: string, versionId: string, analysis: AtsAnalysisResult) => Promise<void>;
}

const defaultResumeData = (title: string, template: ResumeData['template'] = 'professional'): Omit<ResumeDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'> => ({
  title,
  template,
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    gitHub: '',
    portfolio: '',
    professionalTitle: '',
  },
  professionalSummary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  interests: [],
  sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications', 'achievements', 'languages', 'interests'],
  atsScore: null,
});

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  activeResume: null,
  versions: [],
  analyses: [],
  loading: false,
  saving: false,
  error: null,

  fetchResumes: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'resumes'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const resumesList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ResumeDocument));
      set({ resumes: resumesList, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchVersions: async (resumeId) => {
    set({ loading: true });
    try {
      const q = query(
        collection(db, 'resumeVersions'),
        where('resumeId', '==', resumeId),
        orderBy('versionNumber', 'desc')
      );
      const snap = await getDocs(q);
      const versionsList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ResumeVersionDocument));
      set({ versions: versionsList, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAnalyses: async (resumeId) => {
    try {
      const q = query(
        collection(db, 'resumeAnalyses'),
        where('resumeId', '==', resumeId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ResumeAnalysisDocument));
      set({ analyses: list });
    } catch (err: any) {
      console.error('Error fetching resume analyses:', err);
    }
  },

  createResume: async (userId, title, template = 'professional', initialData) => {
    set({ saving: true, error: null });
    try {
      const baseData = defaultResumeData(title, template);
      
      // Prefill if initial data is supplied (e.g. from user profile or extraction)
      const mergedData = {
        ...baseData,
        ...initialData,
        personalInfo: {
          ...baseData.personalInfo,
          ...(initialData?.personalInfo || {}),
        },
      };

      const newDoc = {
        userId,
        ...mergedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'resumes'), newDoc);
      const created: ResumeDocument = { id: docRef.id, ...newDoc };
      
      // Update local array & stats
      const currentResumes = get().resumes;
      set({ resumes: [created, ...currentResumes], activeResume: created, saving: false });

      // Save activity log
      await addDoc(collection(db, 'activityLogs'), {
        userId,
        type: 'RESUME_CREATED',
        description: `Created resume "${title}"`,
        targetId: docRef.id,
        createdAt: new Date().toISOString(),
      });

      // Update users counters via transaction
      const userRef = doc(db, 'users', userId);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists()) {
          const stats = userDoc.data().stats || {};
          transaction.update(userRef, {
            'stats.resumeCount': (stats.resumeCount || 0) + 1,
            updatedAt: new Date().toISOString()
          });
        }
      });

      return created;
    } catch (err: any) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  updateResume: async (resumeId, updates) => {
    set({ saving: true });
    try {
      const docRef = doc(db, 'resumes', resumeId);
      const dataToSave = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Exclude ID from firestore payload
      const { id, ...cleanData } = dataToSave as any;

      await updateDoc(docRef, cleanData);

      // Sync active state
      const active = get().activeResume;
      const updatedActive = active && active.id === resumeId ? { ...active, ...cleanData } : active;

      // Sync resumes array
      const updatedResumes = get().resumes.map(r => r.id === resumeId ? { ...r, ...cleanData } : r);

      set({ resumes: updatedResumes, activeResume: updatedActive, saving: false });
    } catch (err: any) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  duplicateResume: async (resumeId) => {
    set({ saving: true, error: null });
    try {
      const target = get().resumes.find(r => r.id === resumeId);
      if (!target) throw new Error('Resume not found');

      const duplicatedDoc = {
        ...target,
        title: `Copy of ${target.title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { id, ...cleanPayload } = duplicatedDoc as any;
      const docRef = await addDoc(collection(db, 'resumes'), cleanPayload);
      const created = { id: docRef.id, ...cleanPayload } as ResumeDocument;

      set({ resumes: [created, ...get().resumes], saving: false });

      // Save activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: target.userId,
        type: 'RESUME_CREATED',
        description: `Duplicated resume "${target.title}" as "${created.title}"`,
        targetId: docRef.id,
        createdAt: new Date().toISOString(),
      });

      // Update counters
      const userRef = doc(db, 'users', target.userId);
      await updateDoc(userRef, {
        'stats.resumeCount': (get().resumes.length),
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      set({ error: err.message, saving: false });
    }
  },

  deleteResume: async (resumeId) => {
    set({ loading: true, error: null });
    try {
      const target = get().resumes.find(r => r.id === resumeId);
      if (!target) return;

      const userId = target.userId;
      await deleteDoc(doc(db, 'resumes', resumeId));

      const updatedResumes = get().resumes.filter(r => r.id !== resumeId);
      const active = get().activeResume;
      const updatedActive = active && active.id === resumeId ? null : active;

      set({ resumes: updatedResumes, activeResume: updatedActive, loading: false });

      // Clean up versions batch-wise
      const q = query(collection(db, 'resumeVersions'), where('resumeId', '==', resumeId));
      const versionsSnap = await getDocs(q);
      const batch = writeBatch(db);
      versionsSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // Clean up activity log
      await addDoc(collection(db, 'activityLogs'), {
        userId,
        type: 'RESUME_EDITED',
        description: `Deleted resume "${target.title}"`,
        targetId: resumeId,
        createdAt: new Date().toISOString(),
      });

      // Decrement stats counter
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'stats.resumeCount': Math.max(0, updatedResumes.length),
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createVersionSnapshot: async (resumeId, _note) => {
    set({ saving: true });
    try {
      const target = get().resumes.find(r => r.id === resumeId) || get().activeResume;
      if (!target) throw new Error('Resume context missing');

      // Fetch versions to compute next version number
      const q = query(
        collection(db, 'resumeVersions'),
        where('resumeId', '==', resumeId)
      );
      const snap = await getDocs(q);
      const nextVersion = snap.size + 1;

      const { id, userId, createdAt, updatedAt, ...snapshotData } = target;

      const newVersion: Omit<ResumeVersionDocument, 'id'> = {
        resumeId,
        userId: target.userId,
        versionNumber: nextVersion,
        templateUsed: target.template,
        atsScore: target.atsScore,
        resumeSnapshot: snapshotData,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'resumeVersions'), newVersion);
      const created = { id: docRef.id, ...newVersion } as ResumeVersionDocument;

      set({ versions: [created, ...get().versions], saving: false });
      return created;
    } catch (err: any) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  restoreVersion: async (resumeId, versionId) => {
    set({ saving: true });
    try {
      const targetVersion = get().versions.find(v => v.id === versionId);
      if (!targetVersion) throw new Error('Version snapshot not found');

      const restoredData: Partial<ResumeDocument> = {
        ...targetVersion.resumeSnapshot,
        atsScore: targetVersion.atsScore,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'resumes', resumeId), restoredData);

      // Reload
      const current = get().resumes.map(r => r.id === resumeId ? { ...r, ...restoredData } : r);
      const active = get().activeResume;
      const updatedActive = active && active.id === resumeId ? { ...active, ...restoredData } : active;

      set({ resumes: current, activeResume: updatedActive, saving: false });
      
      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: targetVersion.userId,
        type: 'RESUME_EDITED',
        description: `Restored resume to version v${targetVersion.versionNumber}`,
        targetId: resumeId,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  saveAtsAnalysis: async (resumeId, versionId, analysis) => {
    const active = get().activeResume;
    if (!active) return;
    try {
      // 1. Write the analysis
      const newAnalysis = {
        userId: active.userId,
        resumeId,
        resumeVersionId: versionId,
        ...analysis,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'resumeAnalyses'), newAnalysis);
      const created = { id: docRef.id, ...newAnalysis } as ResumeAnalysisDocument;

      // 2. Update resume score
      await updateDoc(docRef, { id: docRef.id }); // ensure document is complete
      const resumeRef = doc(db, 'resumes', resumeId);
      await updateDoc(resumeRef, { atsScore: analysis.score });

      // Update version score if exists
      if (versionId) {
        const verRef = doc(db, 'resumeVersions', versionId);
        await updateDoc(verRef, { atsScore: analysis.score });
      }

      // Sync state local copies
      const currentResumes = get().resumes.map(r => r.id === resumeId ? { ...r, atsScore: analysis.score } : r);
      const updatedActive = active.id === resumeId ? { ...active, atsScore: analysis.score } : active;

      set({ 
        resumes: currentResumes, 
        activeResume: updatedActive, 
        analyses: [created, ...get().analyses] 
      });

      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: active.userId,
        type: 'ATS_ANALYSIS',
        description: `Completed ATS review check with score: ${analysis.score}%`,
        targetId: resumeId,
        createdAt: new Date().toISOString(),
      });

      // Update user stats
      const userRef = doc(db, 'users', active.userId);
      await runTransaction(db, async (trans) => {
        const userDoc = await trans.get(userRef);
        if (userDoc.exists()) {
          const stats = userDoc.data().stats || {};
          trans.update(userRef, {
            'stats.atsAnalysisCount': (stats.atsAnalysisCount || 0) + 1,
            updatedAt: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.error('Error writing analysis reports to database:', error);
    }
  },
}));
