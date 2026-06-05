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
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../services/cloudinary';

export interface CertificateDocument {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  issueDate: string;       // YYYY-MM-DD
  expiryDate: string;      // YYYY-MM-DD or ''
  credentialId: string;
  credentialUrl: string;
  // Cloudinary fields
  fileUrl: string;         // secure_url
  publicId: string;        // cloudinary public_id
  fileSize: number;        // bytes
  // Meta
  showInResume: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CertificateState {
  certificates: CertificateDocument[];
  loading: boolean;
  uploading: boolean;
  error: string | null;

  fetchCertificates: (userId: string) => Promise<void>;
  uploadCertificate: (
    userId: string,
    file: File,
    meta: Pick<CertificateDocument, 'name' | 'issuer' | 'issueDate' | 'expiryDate' | 'credentialId' | 'credentialUrl'>
  ) => Promise<CertificateDocument>;
  updateCertificate: (certId: string, updates: Partial<CertificateDocument>) => Promise<void>;
  deleteCertificate: (certId: string) => Promise<void>;
  toggleShowInResume: (certId: string) => Promise<void>;
}

export const useCertificateStore = create<CertificateState>((set, get) => ({
  certificates: [],
  loading: false,
  uploading: false,
  error: null,

  fetchCertificates: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertificateDocument));
      set({ certificates: list, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  uploadCertificate: async (userId, file, meta) => {
    set({ uploading: true, error: null });
    try {
      // 1. Upload to Cloudinary
      const result = await uploadToCloudinary(file, userId, 'certificates');

      // 2. Persist metadata to Firestore
      const now = new Date().toISOString();
      const docData: Omit<CertificateDocument, 'id'> = {
        userId,
        ...meta,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileSize: result.bytes,
        showInResume: false,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'certificates'), docData);
      const created: CertificateDocument = { id: docRef.id, ...docData };

      set({ certificates: [created, ...get().certificates], uploading: false });

      // 3. Activity log
      await addDoc(collection(db, 'activityLogs'), {
        userId,
        type: 'CERTIFICATE_UPLOADED',
        description: `Uploaded certificate: "${meta.name}" from ${meta.issuer}`,
        targetId: docRef.id,
        createdAt: now,
      });

      // 4. Increment user stats
      const userRef = doc(db, 'users', userId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (snap.exists()) {
          const stats = snap.data().stats || {};
          tx.update(userRef, {
            'stats.certificatesCount': (stats.certificatesCount || 0) + 1,
            updatedAt: now,
          });
        }
      });

      return created;
    } catch (err: any) {
      set({ error: err.message, uploading: false });
      throw err;
    }
  },

  updateCertificate: async (certId, updates) => {
    try {
      const now = new Date().toISOString();
      const docRef = doc(db, 'certificates', certId);
      const payload = { ...updates, updatedAt: now };
      await updateDoc(docRef, payload);
      const list = get().certificates.map(c =>
        c.id === certId ? { ...c, ...payload } : c
      );
      set({ certificates: list });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCertificate: async (certId) => {
    try {
      const target = get().certificates.find(c => c.id === certId);
      if (!target) return;

      await deleteDoc(doc(db, 'certificates', certId));
      const list = get().certificates.filter(c => c.id !== certId);
      set({ certificates: list });

      // Decrement user stats
      const userRef = doc(db, 'users', target.userId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (snap.exists()) {
          const stats = snap.data().stats || {};
          tx.update(userRef, {
            'stats.certificatesCount': Math.max(0, (stats.certificatesCount || 0) - 1),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  toggleShowInResume: async (certId) => {
    const cert = get().certificates.find(c => c.id === certId);
    if (!cert) return;
    await get().updateCertificate(certId, { showInResume: !cert.showInResume });
  },
}));
