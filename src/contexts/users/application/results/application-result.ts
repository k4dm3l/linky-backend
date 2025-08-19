import {
  UserDto,
  UserListDto,
  UserStatisticsDto,
} from "@/contexts/users/application/dtos/user-dto";

export interface ApplicationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export type CreateUserResult = ApplicationResult<UserDto>;
export type UpdateUserResult = ApplicationResult<UserDto>;
export type ChangeEmailResult = ApplicationResult<UserDto>;
export type DeleteUserResult = ApplicationResult;
export type GetUserResult = ApplicationResult<UserDto>;
export type GetUsersResult = ApplicationResult<UserListDto>;
export type GetUserStatisticsResult = ApplicationResult<UserStatisticsDto>;
