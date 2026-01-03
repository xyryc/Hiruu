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
  const percentage = (value / max) * 100;

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
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
          {value.toFixed(1)}/{max}
        </Text>
      </View>

      <View className="w-full bg-white rounded-full h-3 mt-2 overflow-hidden">
        <Animated.View
          style={animatedStyle}
          className="bg-[#4FB2F3] h-full rounded-full"
        />
      </View>
    </View>
  );
}
