export interface AuthenticateUserQuery {
  email: string;
  password: string;
}

export interface AuthenticateUserQueryResult {
  userId: string;
  email: string;
  token: string;
} 