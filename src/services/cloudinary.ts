/**
 * Cloudinary file upload service.
 * Handles unsigned uploads for profile photos, resumes, certificates, and job applications.
 */

export type CloudinaryFolderType =
  | 'profile'
  | 'imports'
  | 'resumes'
  | 'certificates'
  | 'coverletters'
  | 'applications';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  resource_type: string;
}

/**
 * Uploads a file to Cloudinary under a user-specific folder.
 * Falls back to local Object URLs if Cloudinary is not configured.
 */
export async function uploadToCloudinary(
  file: File,
  userId: string,
  folderType: CloudinaryFolderType
): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'resume-craft-upload';

  if (!cloudName) {
    console.warn('Cloudinary is not configured. Falling back to object URL.');
    return {
      secure_url: URL.createObjectURL(file),
      public_id: `local/${Date.now()}`,
      bytes: file.size,
      format: file.type.split('/')[1] || 'bin',
      resource_type: file.type.startsWith('image') ? 'image' : 'raw',
    };
  }

  const folder = `users/${userId}/${folderType}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    bytes: data.bytes,
    format: data.format,
    resource_type: data.resource_type,
  };
}

/** Convenience wrapper that returns only the secure URL (backward compat) */
export async function uploadFileGetUrl(
  file: File,
  userId: string,
  folderType: CloudinaryFolderType
): Promise<string> {
  const result = await uploadToCloudinary(file, userId, folderType);
  return result.secure_url;
}
