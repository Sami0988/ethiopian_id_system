export interface ApiError {
  requestId: string;
  errorCode: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
}
