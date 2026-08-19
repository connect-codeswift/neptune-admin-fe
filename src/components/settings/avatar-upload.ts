/**
 * Profile-photo upload for the tenant Settings avatar card.
 *
 * ## Why this does not use `src/services/files.service.ts`
 *
 * The obvious choice would be the private-bucket uploader this repo already has
 * (`upload-intent` → `PUT` signed URL → `commit`, per `FEGuides/Files.md`), which is the
 * platform's supported path for every other attachment. It cannot be used here, for one
 * concrete reason: `POST /v1/users/me/avatar` stores a **URL**, and validates it against an
 * allow-list of exactly one host — HTTPS on `res.cloudinary.com`
 * (`CloudinaryUrlValidator.cs`). The Files API hands back a short-lived signed URL on
 * `*.r2.cloudflarestorage.com`, so posting one is a guaranteed 400. It also expires in 15
 * minutes, and the avatar column is meant to be permanent.
 *
 * `FEGuides/Files.md` lists `neptune-admin-fe` as having **0** call sites to migrate and says
 * the avatar/URL fields change per module, "when its module guide says so". The avatar endpoint
 * has not been migrated. So the only path that works today is the one
 * `FEGuides/TenantUserProfile.md` describes: upload from the browser straight to Cloudinary with
 * an unsigned preset, then send the resulting `secure_url`.
 *
 * ## Why it is env-gated
 *
 * That flow needs `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and
 * `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, and this repo has never had them — nothing in the
 * admin portal uploaded an image before. Rather than ship a picker that fails with an opaque
 * error wherever they are unset, the card asks {@link isAvatarUploadConfigured} first and
 * explains itself when the answer is no. Removing the photo works either way: that is a DELETE
 * with no upload behind it.
 *
 * When the backend migrates the avatar field to a `fileId`, this whole module is deleted and
 * the card calls `uploadFile(file, "Profile")` from `src/lib/upload-file.ts` instead.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

/** `Profile` is a 5 MB module on the platform's own limits; match it. */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const AVATAR_ACCEPT_ATTRIBUTE = ALLOWED_AVATAR_TYPES.join(",");

export function isAvatarUploadConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Returns an error message, or null when the file is acceptable. */
export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG or WebP image.";
  }
  if (file.size <= 0) return "That file is empty.";
  if (file.size > MAX_AVATAR_BYTES) {
    return "Choose an image under 5 MB.";
  }
  return null;
}

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

/**
 * Uploads to Cloudinary and returns the `secure_url` to hand to `POST /v1/users/me/avatar`.
 *
 * Deliberately a bare `fetch`: this does not go to the Neptune API, and attaching the bearer
 * token our axios instance adds would be sending a session credential to a third party.
 */
export async function uploadAvatarImage(file: File): Promise<string> {
  if (!isAvatarUploadConfigured()) {
    throw new Error("Photo uploads are not configured for this environment.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body },
  );

  const payload = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? "Could not upload that image.");
  }

  return payload.secure_url;
}
