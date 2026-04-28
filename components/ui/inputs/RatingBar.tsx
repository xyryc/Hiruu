import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type TRatingBar = {
  label: string;
  value: number;
  max: number;
};

export default function RatingBar({ label, value, max }: TRatingBar) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(value, max)) : 0;
  const percentage = (safeValue / max) * 100;
  const displayValue = Number(safeValue.toFixed(1));

  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${percentage}%`, {
      damping: 15,
      stiffness: 100,
    }),
  }));

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center">
        <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
          {label}
        </Text>
        <Text className="font-proximanova-bold text-[15px] text-primary dark:text-dark-primary">
          {displayValue}/{max}
        </Text>
      </View>

      <View className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-[#F7FBFF]">
        <Animated.View
          style={animatedStyle}
          className="bg-[#4FB2F3] h-full rounded-full"
        />
      </View>
    </View>
  );
}
