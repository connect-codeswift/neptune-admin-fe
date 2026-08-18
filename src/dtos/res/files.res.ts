export type UploadIntentResponse = {
  fileId: string;
  uploadUrl: string;
  thumbnailUploadUrl: string | null;
  expiresAtUtc: string;
};

export type CommitFileResponse = {
  fileId: string;
};

export type StoredFileResponse = {
  fileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  thumbnailUrl: string | null;
  createdDate: string;
};
