import { UserDto, UserListDto, UserStatisticsDto } from "../dtos/user-dto";

export interface ApplicationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export interface CreateUserResult extends ApplicationResult<UserDto> {}
export interface UpdateUserResult extends ApplicationResult<UserDto> {}
export interface ChangeEmailResult extends ApplicationResult<UserDto> {}
export interface DeleteUserResult extends ApplicationResult<void> {}
export interface GetUserResult extends ApplicationResult<UserDto> {}
export interface GetUsersResult extends ApplicationResult<UserListDto> {}
export interface GetUserStatisticsResult extends ApplicationResult<UserStatisticsDto> {} 