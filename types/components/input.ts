import { GestureResponderEvent } from "react-native";

export interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  value?: string;
}

export interface AttachmentUploadProps {
  onPress?: (event: GestureResponderEvent) => void;
}

export interface NamePlateCardProps {
  variant: string;
  className?: string;
  name?: string;
  address?: string;
  profileImage?: any;
}
