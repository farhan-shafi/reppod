const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);
export const MAX_IMAGE_MB = 10;

/** Unsigned client-side image upload to Cloudinary. Returns the secure URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!cloudinaryConfigured) {
    throw new Error("Image uploads aren't configured.");
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    const mb = (file.size / 1024 / 1024).toFixed(0);
    throw new Error(`That image is ${mb} MB — keep photos under ${MAX_IMAGE_MB} MB.`);
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? "Upload failed.");
  }
  return data.secure_url as string;
}
