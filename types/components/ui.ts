import { ImageSource } from "expo-image";
import { Dispatch, ReactElement, SetStateAction } from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";

export interface PrimaryButtonProps {
  className?: string;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  iconSize?: number;
  showIcon?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export interface SecondaryButtonProps {
  className?: string;
  textClass?: string;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  iconColor?: string;
  iconBackground?: string;
}

export interface SmallButtonProps {
  className?: string;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  textClass?: string;
}

export interface GradientButtonProps {
  className?: string;
  title: string;
  icon: React.JSX.Element;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export interface TitleHeaderProps {
  className?: string;
  title: string;
  subtitle: string;
}

export interface DateOfBirthInputProps {
  value: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export type GenderOption = "male" | "female" | "other" | null;

export interface GenderSelectionProps {
  value: GenderOption;
  onGenderChange: (gender: GenderOption) => void;
}

export interface ProfileImagePickerProps {
  value: string | null;
  onImageChange: (imageUri: string | null) => void;
  size?: number;
}

export interface Company {
  id: string;
  name: string;
}

export interface Companies {
  companyId: string;
  companyName: string;
  logo?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  position?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface MultiSelectCompanyDropdownProps {
  selectedCompanies: Company[];
  workExperiences: Companies[];
  onCompaniesChange: (companies: Company[]) => void;
  onWorkExperiencesChange: (experiences: Companies[]) => void;
}

export interface HomeHeaderProps {
  className?: string;
}

export interface WelcomeHeaderProps {
  className?: string;
  name?: string;
  avatar?: any;
  coins?: number;
}

export interface JoinColleagueProps {
  className?: string;
}

export interface FindNewJobProps {
  className?: string;
  business?: boolean;
}

export interface ActionCardProps {
  title: string;
  buttonTitle?: string;
  rightImage: ImageSource;
  imageClass?: string;
  imageWidth: number;
  imageHeight: number;
  background: ImageSource;
  backgroundClass?: string;
  backgroundWidth?: number;
  backgroundHeight?: number;
  onPress?: (event: GestureResponderEvent) => void;
}

export interface BusinessProfileProps {
  className?: string;
}

export interface ProfileProgressProps {
  className?: string;
  onboarding?: number | null;
}

export interface TodaysShiftProps {
  className?: string;
}

interface Business {
  id: string;
  name: string;
  imageUrl: string;
}

export interface BusinessSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  businesses: Business[];
  selectedBusinesses: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export interface SwapShiftModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface QuickActionProps {
  className?: string;
}

export interface ActionIconCardProps {
  icon: ReactElement<any, any>;
  title: string;
  count?: number;
  onPress?: (event: GestureResponderEvent) => void;
}

export interface WorkInsightsProps {
  className?: string;
}

export interface MonthPickerProps {
  value: Date | null;
  onDateChange: (date: Date) => void;
  bgColor?: string;
}

export interface StatCardPrimaryProps {
  background: string;
}

export interface StatCardSecondaryProps {
  background: string;
  business?: boolean;
}

type StatusType =
  | "upcoming"
  | "completed"
  | "missed"
  | "ongoing"
  | "pending"
  | "approved"
  | "rejected"
  | "accepted"
  | "submitted"
  | "available";

export interface StatusBadgeProps {
  label?: string;
  status: StatusType;
  size?: "small" | "medium" | "large";
  className?: string;
}

export interface SimpleStatusBadgeProps {
  className?: string;
  title: string;
  textColor?: string;
  bgColor?: string;
  onPress?: () => void;
}

export interface EngagementPerksProps {
  className?: string;
}

export interface WidgetsProps {
  className?: string;
}

export interface NoTaskCardProps {
  className?: string;
}

export interface ShiftHeaderProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  displayContent?: any;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export interface WorkShiftCardProps {
  shiftTitle: string;
  startTime: string;
  endTime: string;
  startsAt?: string;
  endsAt?: string;
  startDateTime?: string;
  endDateTime?: string;
  shiftImage: any;
  teamMembers: string[];
  totalMembers: number;
  address: string;
  city: string;
  onLoginPress: () => void;
  requestLog?: boolean;
  status?:
  | "ongoing"
  | "upcoming"
  | "completed"
  | "missed"
  | "pending"
  | "approved"
  | "rejected"
  | "accepted";
}

export interface ScreenHeaderProps {
  onPressBack?: () => void;
  title: string;
  iconColor?: string;
  titleClass?: string;
  buttonTitle?: string;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
  components?: React.ReactNode;
}

export interface CountdownTimerProps {
  className: string;
  targetTime: Date | string;
  onComplete?: () => void;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export type RecruitmentShiftType = "remote" | "hybrid" | "onsite";

export interface JobCardProps {
  className?: string;
  compact?: boolean;
  job?: {
    id: string;
    businessId?: string;
    roleId?: string;
    name: string;
    description?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    shareCount?: number;
    shiftType?: RecruitmentShiftType;
    jobType?: string;
    salaryMin: number;
    salaryMax: number;
    salaryType: string;
    distanceKm?: number;
    shiftStartTime?: string;
    shiftEndTime?: string;
    role?: {
      id?: string;
      role?: {
        id?: string;
        name?: string;
      };
    };
    business?: {
      id: string;
      name: string;
      logo?: string;
      address?: string;
      isPremium?: boolean;
    } | null;
    _count?: {
      recruitmentApplications?: number;
    };
  };
}

export interface JobRequestCardProps {
  className?: string;
  status: "send request" | "received";
  job?: JobCardProps["job"];
}

export interface BusinessJobCardProps {
  className?: string;
  status?: string;
  candidate?: boolean;
  received?: boolean;
}

