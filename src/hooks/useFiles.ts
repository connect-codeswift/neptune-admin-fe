"use client";

import { useQuery } from "@tanstack/react-query";
import { isBlobUrl, isLegacyPublicUrl, isStoredFileId } from "@/lib/files";
import { getStoredFile } from "@/services/files.service";

export const FILE_DETAIL_KEY = ["files"] as const;

export function fileDetailQueryKey(fileId: string) {
  return [...FILE_DETAIL_KEY, fileId] as const;
}

const FILE_URL_STALE_MS = 8 * 60 * 1000;

export function useStoredFileQuery(fileId: string | null | undefined) {
  const enabled = Boolean(fileId && isStoredFileId(fileId));
  return useQuery({
    queryKey: fileDetailQueryKey(fileId ?? ""),
    queryFn: () => getStoredFile(fileId!),
    enabled,
    staleTime: FILE_URL_STALE_MS,
    refetchOnWindowFocus: true,
  });
}

export function useResolvedFileUrl(ref: string | null | undefined) {
  const trimmed = ref?.trim() || "";
  const storedId = isStoredFileId(trimmed) ? trimmed : null;
  const query = useStoredFileQuery(storedId);

  if (!trimmed) {
    return { url: undefined, thumbnailUrl: undefined, isLoading: false };
  }
  if (isBlobUrl(trimmed) || isLegacyPublicUrl(trimmed)) {
    return { url: trimmed, thumbnailUrl: undefined, isLoading: false };
  }
  if (storedId) {
    return {
      url: query.data?.downloadUrl,
      thumbnailUrl: query.data?.thumbnailUrl ?? undefined,
      isLoading: query.isLoading,
    };
  }
  return { url: trimmed, thumbnailUrl: undefined, isLoading: false };
}
