export type AuthResult<T> = {
  success: true;
  data: T;
  message?: string;
} | {
  success: false;
  error: string;
  errorCode: string;
  details?: Record<string, any>;
  timestamp: Date;
};

export interface AuthSuccessResult<T> {
  success: true;
  data: T;
  message?: string;
}

export interface AuthErrorResult {
  success: false;
  error: string;
  errorCode: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export class AuthResultBuilder {
  static success<T>(data: T, message?: string): AuthSuccessResult<T> {
    return {
      success: true,
      data,
      message
    };
  }

  static error(error: string, errorCode: string, details?: Record<string, any>): AuthErrorResult {
    return {
      success: false,
      error,
      errorCode,
      details,
      timestamp: new Date()
    };
  }
} 