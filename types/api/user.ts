export interface AddressData {
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface SocialData {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  telegram?: string;
  other?: string;
}

export interface ExperienceData {
  companyId: string;
  position?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  address?: AddressData;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  interest?: string[];
  phoneNumber?: string;
  countryCode?: string;
  fcmToken?: string;
  onboarding?: number;
  social?: SocialData;
  experiences?: ExperienceData[];
  avatar?: {
    uri: string;
    type: string;
    name: string;
  };
  // Legacy/compat fields that still exist in the UI/store
  firstName?: string;
  lastName?: string;
}

export interface UpdatePreferencesData {
  smartAlert: boolean;
  smartAlertTime: number;
}

export interface AppSettingsData {
  id?: string;
  userId?: string;
  language?: string;
  timeZone?: string;
  theme?: string;
  smartAlert?: boolean;
  smartAlertTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    id: string;
    name?: string;
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
    appSettings?: AppSettingsData;
  } | null;
}

export interface UpdatePreferencesResponse extends ProfileResponse {}
