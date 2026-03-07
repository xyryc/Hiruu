export interface RegisterData {
  email?: string;
  password?: string;
  countryCode?: string;
  phoneNumber?: string;
  fcmToken?: string;
  rememberMe?: boolean;
  role?: "user" | "provider";
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email?: string;
  password?: string;
  countryCode?: string;
  phoneNumber?: string;
  rememberMe?: boolean;
  fcmToken?: string;
}

export interface OAuthData {
  provider: "google" | "apple";
  oauthId: string;
}

export interface VerifyAccountData {
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  code: string;
}

export interface ForgotPasswordData {
  email?: string;
  phoneNumber?: string;
}

export interface ResetPasswordData {
  email?: string;
  phoneNumber?: string;
  otp: string;
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface RequestVerifyAccountData {
  type: "both" | "email" | "phone";
}

export interface ResendOTPData {
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export interface AddContactData {
  phoneNumber: string;
  countryCode: string;
  otp?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatar: string;
    isEmailVerified: boolean;
    fcmToken?: string;
    phoneNumber?: string;
    countryCode?: string;
    isRestricted: boolean;
    restrictionReason?: string;
    bio?: string;
    isOnline: boolean;
    lastSeen?: string;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  debug?: {
    otp?: string;
  };
  tokens?: {
    access: {
      token: string;
      expiresAt: string;
    };
    refresh: {
      token: string;
      expiresAt: string;
    };
  };
}

export interface SimpleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: any;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    id: string;
    role: string;
  } | null;
  tokens?: {
    access: {
      token: string;
      expiresAt: string;
    };
    refresh: {
      token: string;
      expiresAt: string;
    };
  };
}
