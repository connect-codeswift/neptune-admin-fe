import type { CreateUploadIntentPayload } from "@/dtos/req/files.req";
import type {
  CommitFileResponse,
  StoredFileResponse,
  UploadIntentResponse,
} from "@/dtos/res/files.res";
import { assertApiSuccess, unwrapDataModel } from "@/lib/api-response";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** POST /files/upload-intent */
export async function createUploadIntent(payload: CreateUploadIntentPayload) {
  const { data } = await axiosInstance.post<ApiResponse<UploadIntentResponse>>(
    "/files/upload-intent",
    payload,
  );
  assertApiSuccess(data, "Could not start the upload.");
  const model = unwrapDataModel<UploadIntentResponse>(data);
  if (!model?.fileId || !model.uploadUrl) {
    throw new Error(data.message || "Could not start the upload.");
  }
  return model;
}

/** PUT the raw file to the signed bucket URL. Do not attach a bearer token. */
export async function putFileToSignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) {
    throw new Error("Upload was not completed");
  }
}

/** POST /files/{fileId}/commit */
export async function commitFile(fileId: string) {
  const { data } = await axiosInstance.post<ApiResponse<CommitFileResponse>>(
    `/files/${fileId}/commit`,
  );
  assertApiSuccess(data, "Upload was not completed");
  return unwrapDataModel<CommitFileResponse>(data)?.fileId ?? fileId;
}

/** GET /files/{fileId} — downloadUrl is valid for 15 minutes. Do not persist it. */
export async function getStoredFile(fileId: string) {
  const { data } = await axiosInstance.get<ApiResponse<StoredFileResponse>>(
    `/files/${fileId}`,
  );
  assertApiSuccess(data, "File not found");
  const model = unwrapDataModel<StoredFileResponse>(data);
  if (!model?.fileId || !model.downloadUrl) {
    throw new Error(data.message || "File not found");
  }
  return model;
}
