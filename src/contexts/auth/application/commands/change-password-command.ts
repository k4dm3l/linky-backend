export interface ChangePasswordCommand {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordCommandResult {
  userId: string;
  message: string;
}
