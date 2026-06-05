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
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ApplicationDocument {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  location: string;
  salary: string;
  source: 'LinkedIn' | 'Naukri' | 'Indeed' | 'Company Website' | 'Referral' | 'Placement' | 'Other';
  dateApplied: string; // ISO String
  notes: string;
  status:
    | 'Wishlist'
    | 'Applied'
    | 'Viewed'
    | 'Assessment'
    | 'Interview Round 1'
    | 'Interview Round 2'
    | 'Interview Round 3'
    | 'HR Round'
    | 'Offer Received'
    | 'Rejected'
    | 'Withdrawn'
    | 'Joined';
  resumeId: string | null;
  resumeVersionId: string | null;
  coverLetterId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewDocument {
  id: string;
  userId: string;
  applicationId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  interviewType: 'Virtual' | 'In-Person' | 'Phone';
  round: string;
  interviewer: string;
  notes: string;
  feedback: string;
  createdAt: string;
}

export interface CoverLetterDocument {
  id: string;
  userId: string;
  title: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  jobTitle: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationState {
  applications: ApplicationDocument[];
  interviews: InterviewDocument[];
  coverLetters: CoverLetterDocument[];
  loading: boolean;
  error: string | null;

  // Application Pipeline
  fetchApplications: (userId: string) => Promise<void>;
  addApplication: (app: Omit<ApplicationDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApplicationDocument>;
  updateApplication: (appId: string, updates: Partial<ApplicationDocument>) => Promise<void>;
  deleteApplication: (appId: string) => Promise<void>;

  // Interview Tracker
  fetchInterviews: (userId: string) => Promise<void>;
  addInterview: (interview: Omit<InterviewDocument, 'id' | 'createdAt'>) => Promise<InterviewDocument>;
  updateInterview: (interviewId: string, updates: Partial<InterviewDocument>) => Promise<void>;
  deleteInterview: (interviewId: string) => Promise<void>;

  // Cover Letter Manager
  fetchCoverLetters: (userId: string) => Promise<void>;
  addCoverLetter: (cl: Omit<CoverLetterDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CoverLetterDocument>;
  updateCoverLetter: (clId: string, updates: Partial<CoverLetterDocument>) => Promise<void>;
  deleteCoverLetter: (clId: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  interviews: [],
  coverLetters: [],
  loading: false,
  error: null,

  fetchApplications: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', userId),
        orderBy('dateApplied', 'desc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDocument));
      set({ applications: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addApplication: async (app) => {
    set({ loading: true, error: null });
    try {
      const newApp = {
        ...app,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'applications'), newApp);
      const created = { id: docRef.id, ...newApp } as ApplicationDocument;
      
      set({ 
        applications: [created, ...get().applications], 
        loading: false 
      });

      // Log Activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: app.userId,
        type: 'APPLICATION_ADDED',
        description: `Added job application for "${app.jobTitle}" at "${app.company}"`,
        targetId: docRef.id,
        createdAt: new Date().toISOString(),
      });

      // Increment stats counter
      const userRef = doc(db, 'users', app.userId);
      await runTransaction(db, async (trans) => {
        const docSnap = await trans.get(userRef);
        if (docSnap.exists()) {
          const stats = docSnap.data().stats || {};
          trans.update(userRef, {
            'stats.applicationsCount': (stats.applicationsCount || 0) + 1,
            updatedAt: new Date().toISOString()
          });
        }
      });

      return created;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateApplication: async (appId, updates) => {
    try {
      const docRef = doc(db, 'applications', appId);
      const dataToSave = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, dataToSave);

      const list = get().applications.map(a => a.id === appId ? { ...a, ...dataToSave } : a);
      set({ applications: list });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteApplication: async (appId) => {
    set({ loading: true });
    try {
      const target = get().applications.find(a => a.id === appId);
      if (!target) return;

      await deleteDoc(doc(db, 'applications', appId));
      const list = get().applications.filter(a => a.id !== appId);
      set({ applications: list, loading: false });

      // Clean up linked interviews
      const q = query(collection(db, 'interviews'), where('applicationId', '==', appId));
      const intsSnap = await getDocs(q);
      for (const d of intsSnap.docs) {
        await deleteDoc(d.ref);
      }
      set({ interviews: get().interviews.filter(i => i.applicationId !== appId) });

      // Decrement stats counter
      const userRef = doc(db, 'users', target.userId);
      await runTransaction(db, async (trans) => {
        const docSnap = await trans.get(userRef);
        if (docSnap.exists()) {
          const stats = docSnap.data().stats || {};
          trans.update(userRef, {
            'stats.applicationsCount': Math.max(0, (stats.applicationsCount || 0) - 1),
            updatedAt: new Date().toISOString()
          });
        }
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchInterviews: async (userId) => {
    try {
      const q = query(
        collection(db, 'interviews'),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as InterviewDocument));
      set({ interviews: list });
    } catch (err: any) {
      console.error('Error fetching interviews:', err);
    }
  },

  addInterview: async (interview) => {
    try {
      const newInt = {
        ...interview,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'interviews'), newInt);
      const created = { id: docRef.id, ...newInt } as InterviewDocument;

      set({ interviews: [...get().interviews, created] });

      // Update stats counter
      const userRef = doc(db, 'users', interview.userId);
      await runTransaction(db, async (trans) => {
        const docSnap = await trans.get(userRef);
        if (docSnap.exists()) {
          const stats = docSnap.data().stats || {};
          trans.update(userRef, {
            'stats.interviewsCount': (stats.interviewsCount || 0) + 1,
            updatedAt: new Date().toISOString()
          });
        }
      });

      // Update application status to reflects interview round
      const appRef = doc(db, 'applications', interview.applicationId);
      await updateDoc(appRef, {
        status: 'Interview Round 1',
        updatedAt: new Date().toISOString(),
      });
      // Sync local app status
      const updatedApps = get().applications.map(a => 
        a.id === interview.applicationId 
          ? { ...a, status: 'Interview Round 1' as const, updatedAt: new Date().toISOString() } 
          : a
      );
      set({ applications: updatedApps });

      // Log Activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: interview.userId,
        type: 'INTERVIEW_SCHEDULED',
        description: `Scheduled interview round "${interview.round}" on ${interview.date}`,
        targetId: docRef.id,
        createdAt: new Date().toISOString(),
      });

      return created;
    } catch (err: any) {
      console.error('Error adding interview:', err);
      throw err;
    }
  },

  updateInterview: async (interviewId, updates) => {
    try {
      const docRef = doc(db, 'interviews', interviewId);
      await updateDoc(docRef, updates);

      const list = get().interviews.map(i => i.id === interviewId ? { ...i, ...updates } : i);
      set({ interviews: list });
    } catch (err: any) {
      console.error('Error updating interview:', err);
      throw err;
    }
  },

  deleteInterview: async (interviewId) => {
    try {
      const target = get().interviews.find(i => i.id === interviewId);
      if (!target) return;

      await deleteDoc(doc(db, 'interviews', interviewId));
      set({ interviews: get().interviews.filter(i => i.id !== interviewId) });

      // Decrement stats counter
      const userRef = doc(db, 'users', target.userId);
      await runTransaction(db, async (trans) => {
        const docSnap = await trans.get(userRef);
        if (docSnap.exists()) {
          const stats = docSnap.data().stats || {};
          trans.update(userRef, {
            'stats.interviewsCount': Math.max(0, (stats.interviewsCount || 0) - 1),
            updatedAt: new Date().toISOString()
          });
        }
      });
    } catch (err) {
      console.error('Error deleting interview:', err);
    }
  },

  fetchCoverLetters: async (userId) => {
    try {
      const q = query(
        collection(db, 'coverLetters'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CoverLetterDocument));
      set({ coverLetters: list });
    } catch (err) {
      console.error('Error fetching cover letters:', err);
    }
  },

  addCoverLetter: async (cl) => {
    try {
      const newCl = {
        ...cl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'coverLetters'), newCl);
      const created = { id: docRef.id, ...newCl } as CoverLetterDocument;

      set({ coverLetters: [created, ...get().coverLetters] });

      // Log Activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: cl.userId,
        type: 'COVER_LETTER_CREATED',
        description: `Created cover letter "${cl.title}"`,
        targetId: docRef.id,
        createdAt: new Date().toISOString(),
      });

      return created;
    } catch (err) {
      console.error('Error adding cover letter:', err);
      throw err;
    }
  },

  updateCoverLetter: async (clId, updates) => {
    try {
      const docRef = doc(db, 'coverLetters', clId);
      const dataToSave = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, dataToSave);

      const list = get().coverLetters.map(c => c.id === clId ? { ...c, ...dataToSave } : c);
      set({ coverLetters: list });
    } catch (err) {
      console.error('Error updating cover letter:', err);
      throw err;
    }
  },

  deleteCoverLetter: async (clId) => {
    try {
      await deleteDoc(doc(db, 'coverLetters', clId));
      set({ coverLetters: get().coverLetters.filter(c => c.id !== clId) });
    } catch (err) {
      console.error('Error deleting cover letter:', err);
    }
  },
}));
