export interface GetUserProfileQuery {
  userId: string;
}

export interface GetUserProfileQueryResult {
  userId: string;
  email: string;
  name: string;
  profileImage: string | null;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  plan: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
