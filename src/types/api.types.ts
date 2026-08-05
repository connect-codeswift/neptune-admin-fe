export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  isError: boolean;
  errorDetails: string | null;
  dataModel?: T;
}

export type ApiPayload = Record<string, unknown>;
