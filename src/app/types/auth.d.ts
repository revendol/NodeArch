export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}
export interface IRefreshTokenRequest {
  token: string;
}
export interface IResetPasswordRequest {
  code: string,
  email: string,
  password: string,
  password_confirmation: string
}

export interface IResetPasswordEmailRequest {
  email: string
}

export interface IAuthMiddlewareData {
  email: string;
  name: string;
  role: string;
}

