export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  profileImage: string | null;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  plan: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
}

export interface UpdateUserDto {
  name: string;
}

export interface ChangeEmailDto {
  email: string;
}

export interface UserListDto {
  users: UserDto[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}

export interface UserStatisticsDto {
  totalUsers: number;
  usersCreatedToday: number;
  usersCreatedThisWeek: number;
  usersCreatedThisMonth: number;
}
