import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AutoHideTooltipProps {
  message: string;
  duration?: number;
  children: React.ReactNode;
}

const AutoHideTooltip: React.FC<AutoHideTooltipProps> = ({
  message,
  duration = 3000,
  children,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isVisible, duration]);

  return (
    <View className="relative">
      <TouchableOpacity onPress={() => setIsVisible(true)} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>

      {isVisible && (
        <View className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
          <View className="bg-black rounded-lg px-3 py-2 min-w-52">
            <Text className="text-white text-xs font-proximanova-regular text-center">
              {message}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default AutoHideTooltip;
