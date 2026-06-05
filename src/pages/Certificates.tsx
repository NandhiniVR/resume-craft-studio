import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { uploadFileGetUrl } from '@/services/cloudinary';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Upload, 
  Loader2, 
  Calendar, 
  Building, 
  FileText 
} from 'lucide-react';

interface Certificate {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  issueDate: string;
  fileUrl: string;
  createdAt: string;
}

export const Certificates: React.FC = () => {
  const { user, refreshStats } = useAuthStore();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  const fetchCertificates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      console.log('CERTIFICATE DOCS FOUND:', snapshot.docs.length);

snapshot.docs.forEach((d) => {
  console.log('CERT DOC:', d.id, d.data());
});


      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Certificate[];
      setCertificates(list);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      toast({
        title: 'Error loading certificates',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      toast({
        title: 'File required',
        description: 'Please select a certificate file (PDF/Image) to upload.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload to Cloudinary
      const fileUrl = await uploadFileGetUrl(file, user.uid, 'certificates');

      // 2. Perform Firestore Transaction to save certificate & update count stat
      const userRef = doc(db, 'users', user.uid);
      const certColRef = collection(db, 'certificates');
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const currentStats = userDoc.data().stats || {};
        const newCertCount = (currentStats.certificatesCount || 0) + 1;

        // Add certificate document
        const newCertDocRef = doc(certColRef);
        const newCertData = {
          userId: user.uid,
          name,
          issuer,
          issueDate,
          fileUrl,
          createdAt: new Date().toISOString(),
        };
        transaction.set(newCertDocRef, newCertData);

        // Update user stats count
        transaction.update(userRef, {
          'stats.certificatesCount': newCertCount,
          updatedAt: new Date().toISOString(),
        });
      });

      // 3. Track in activityLogs
      try {
        await addDoc(collection(db, 'activityLogs'), {
          userId: user.uid,
          action: 'upload_certificate',
          description: `Uploaded certificate: ${name} issued by ${issuer}`,
          createdAt: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Logging activity failed:', logErr);
      }

      toast({
        title: 'Certificate uploaded',
        description: `${name} has been added successfully.`,
      });

      // Reset form & reload
      setName('');
      setIssuer('');
      setIssueDate('');
      setFile(null);
      setIsOpen(false);
      
      await fetchCertificates();
      await refreshStats();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Upload failed',
        description: err.message || 'Failed to save certificate information.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (certId: string, certName: string) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete "${certName}"?`)) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const certRef = doc(db, 'certificates', certId);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const currentStats = userDoc.data().stats || {};
        const newCertCount = Math.max(0, (currentStats.certificatesCount || 0) - 1);

        // Delete document
        transaction.delete(certRef);

        // Update user stats
        transaction.update(userRef, {
          'stats.certificatesCount': newCertCount,
          updatedAt: new Date().toISOString(),
        });
      });

      // Log activity
      try {
        await addDoc(collection(db, 'activityLogs'), {
          userId: user.uid,
          action: 'delete_certificate',
          description: `Deleted certificate: ${certName}`,
          createdAt: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Logging activity failed:', logErr);
      }

      toast({
        title: 'Deleted successfully',
        description: 'The certificate record was removed.',
      });

      await fetchCertificates();
      await refreshStats();
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not complete deletion.',
        variant: 'destructive',
      });
    }
  };

  const filteredCertificates = certificates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-7 w-7 text-indigo-650" /> Credentials & Certificates
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your credentials and verify certifications to sync direct achievements inside your generated resumes.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-xs py-2 px-4 shadow-sm flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" /> Add Credentials
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or issuer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs border-slate-200/80 bg-white"
        />
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <Card className="border border-slate-200/60 p-8 text-center bg-white dark:bg-slate-900 shadow-sm max-w-md mx-auto">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white font-outfit">
              No Certificates Found
            </h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'No certificates matching your search.' : 'Upload your verification files (PDF/Images) to add certificates to your professional logs.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="border border-slate-200/60 hover:border-slate-300 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="font-outfit text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {cert.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    onClick={() => handleDelete(cert.id, cert.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                <div className="space-y-2 text-xs text-slate-650 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span>{cert.issuer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Issued: {cert.issueDate}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex justify-between items-center">
                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-650 hover:text-indigo-750 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" /> View Credential <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog modal */}
      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Add Verification Credential"
        description="Enter certificate data and upload verification files."
      >
        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-300">Credential Name</label>
            <Input
              placeholder="e.g. AWS Certified Solutions Architect"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-300">Issuing Authority</label>
            <Input
              placeholder="e.g. Amazon Web Services"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-300">Issue Date</label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-300">Verification File (PDF / Image)</label>
            <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg p-4 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={submitting}
                required
              />
              <div className="space-y-1.5 flex flex-col items-center justify-center text-slate-500">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-xs font-semibold">
                  {file ? file.name : 'Upload PDF/Image verification document'}
                </span>
                <span className="text-[10px] text-slate-400">Max size: 5MB</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-650 hover:bg-indigo-750 text-white font-semibold text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Uploading...
                </>
              ) : (
                'Upload & Save'
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Certificates;
