import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

const DynamicBackground = ({
  pickerType,
  profileColor,
  gradientColors,
  children,
  className,
  style,
}: {
  pickerType: "solid" | "gradient";
  profileColor: string;
  gradientColors: [string, string];
  children: React.ReactNode;
  className?: string;
  style?: any;
}) => {
  if (pickerType === "gradient") {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className={className}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      className={className}
      style={[{ backgroundColor: profileColor }, style]}
    >
      {children}
    </View>
  );
};

export default DynamicBackground;
