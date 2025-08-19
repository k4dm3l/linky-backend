export interface RegisterUserRequest {
  email: string;
  password: string;
  name: string;
  profileImage?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  role?: string;
  plan?: string;
}

export interface RegisterUserResponse {
  userId: string;
  email: string;
  name: string;
  profileImage: string | null;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  plan: string;
} 