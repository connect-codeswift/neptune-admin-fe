export const FILE_MODULES = [
  "Incident",
  "NearMiss",
  "Hazard",
  "Audit",
  "Inspection",
  "Capa",
  "Document",
  "HazCom",
  "Bbs",
  "Ppe",
  "Profile",
] as const;

export type FileModule = (typeof FILE_MODULES)[number];

const MB = 1024 * 1024;

export const FILE_MAX_BYTES_BY_MODULE: Readonly<Record<FileModule, number>> = {
  Profile: 5 * MB,
  Document: 50 * MB,
  HazCom: 50 * MB,
  Incident: 25 * MB,
  NearMiss: 25 * MB,
  Hazard: 25 * MB,
  Audit: 25 * MB,
  Inspection: 25 * MB,
  Capa: 25 * MB,
  Bbs: 25 * MB,
  Ppe: 25 * MB,
};

export const FILE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
] as const;

const STORED_FILE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getFileMaxBytes(module: FileModule): number {
  return FILE_MAX_BYTES_BY_MODULE[module];
}

export function isAllowedMimeType(mimeType: string): boolean {
  return (FILE_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function isStoredFileId(value: string | null | undefined): boolean {
  return STORED_FILE_ID_PATTERN.test(value?.trim() ?? "");
}

export function isLegacyPublicUrl(value: string | null | undefined): boolean {
  return /^https?:\/\//i.test(value?.trim() ?? "");
}

export function isBlobUrl(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith("blob:"));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFileForModule(
  file: File,
  module: FileModule,
): string | null {
  const contentType = file.type.trim() || "application/octet-stream";
  if (!isAllowedMimeType(contentType)) {
    return `Files of type '${contentType}' are not allowed`;
  }
  const maxBytes = getFileMaxBytes(module);
  if (file.size <= 0) return "File size is required";
  if (file.size > maxBytes) {
    return `File exceeds the ${String(Math.round(maxBytes / MB))} MB limit`;
  }
  if (!file.name.trim()) return "File name is required";
  return null;
}
