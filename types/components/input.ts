import { GestureResponderEvent } from "react-native";

export interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export interface AttachmentUploadProps {
  onPress?: (event: GestureResponderEvent) => void;
}

export interface NamePlateCardProps {
  variant: string;
  className?: string;
}

export interface LimitedNamePlateCardProps {
  variant: string;
  onPress?: (event: GestureResponderEvent) => void;
  isSelected: boolean; // Add this
}
