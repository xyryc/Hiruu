import { Dispatch, ReactNode, SetStateAction } from "react";

export interface AttachmentPreview {
  uri: string;
  previewType: "image" | "video";
  name: string;
}

export interface ChatInputProps {
  message: string;
  setMessage: (text: string) => void;
  onSend?: () => void;
  attachments?: AttachmentPreview[];
  onPickMedia?: () => void;
  onRemoveMedia?: (uri: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  isSending?: boolean;
  disabled?: boolean;
}

export interface TypingIndicatorProps {
  isTyping?: boolean;
  userName?: string;
}

export interface InterestGridProps {
  selectedInterests: string[];
  onToggle?: (interestId: string) => void;
  readonly?: boolean;
  showSelectedOnly?: boolean;
  interests?: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
}

export interface InterestsSelectionProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  readonly?: boolean;
  showSelectedOnly?: boolean;
}

export interface ColorPickerModalProps {
  pickerType: string;
  setPickerType: Dispatch<SetStateAction<"solid" | "gradient">>;
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string | string[]) => void;
  initialColor?: string;
  initialGradientColors?: [string, string];
}

export interface VideoPlayerModalProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
}

export interface AutoHideTooltipProps {
  message: string;
  duration?: number;
  children: ReactNode;
}

export interface SelectDropdownOption {
  label: string;
  value: string;
  avatar?: string;
}

export interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: SelectDropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  className?: string;
  hideSelectedText?: boolean;
  imageHeight?: number;
  imageWidth?: number;
  listMaxHeight?: number;
  openTrigger?: number;
}

export interface AnimatedFabMenuItem {
  id: string | number;
  title: string;
  icon: any;
  onPress?: () => void;
}

export interface AnimatedFabMenuProps {
  menuItems: AnimatedFabMenuItem[];
  fabIcon?: any;
  fabColor?: string;
  menuItemColor?: string;
}

export interface ProfileSwitchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUserProfile: () => void;
  onSelectBusinessProfile: (businessId: string) => void;
}

export interface AssignRoleItem {
  id: string;
  name: string;
}

export interface AssignRoleModalProps {
  visible: boolean;
  onClose: () => void;
  assignRole: AssignRoleItem[];
  setSelectedAssignRole: (id: string) => void;
  selectedAssignRole: string;
  loading?: boolean;
  onApply?: () => void;
  applying?: boolean;
  emptyStateText?: string;
}

export interface WorkingHourSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  initialPeriod?: string | null;
  initialAmount?: number | null;
  onApply?: (payload: {
    workHourPeriod: string | null;
    workHourAmount: number | null;
  }) => void;
  applying?: boolean;
}

export interface RenderMessageProps {
  msg: {
    id: string | number;
    text: string;
    time: string;
    isSent: boolean;
    status?: string;
    avatar: any;
    media?: {
      id: string;
      uri: string;
      previewType: "image" | "video";
      name?: string;
      thumbnailUrl?: string;
    }[];
    call?: {
      type: "audio" | "video";
      status: string;
      label: string;
      subtitle?: string;
      duration?: string;
    } | null;
    uploadState?: "uploading" | "failed";
  };
  onRetryMediaUpload?: (messageId: string | number) => void;
}

export interface NotificationCardProps {
  timeTitle?: string;
  title: string;
  time: string;
  details: string;
  buttonTitle?: string;
  border?: boolean;
  className?: string;
  icon: ReactNode;
  iconBackgroundColor: string;
  onPress?: () => void;
  isUnread?: boolean;
}
