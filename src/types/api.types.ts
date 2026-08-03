export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  isError: boolean;
  errorDetails: string | null;
  dataModel?: unknown;
}
