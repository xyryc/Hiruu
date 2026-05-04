import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

const RatingProgress = ({ rating }: { rating: number }) => {
  const safeRating = Number(rating);
  const ratings = Number.isFinite(safeRating) ? safeRating * 20 : 0;
  const progress = 0;
  const ratingLabel =
    Number.isFinite(safeRating) && safeRating > 0
      ? `${safeRating.toFixed(1)}/5`
      : "N/A";

  // Color mapping based on progress
  const getTintColor = (fill: number) => {
    if (fill < 25) return "#E39393"; // red
    if (fill < 50) return "#FFBE8F"; // yellow
    if (fill < 75) return "#93E3A4"; // orange
    return "#10B981"; // Green
  };

  const tintColor = getTintColor(ratings || progress);
  return (
    <AnimatedCircularProgress
      size={80}
      width={10}
      fill={ratings || progress}
      rotation={-0} // Start at top (like a gauge)
      tintColor={tintColor}
      backgroundColor="#E5E7EB"
      arcSweepAngle={360} // Only half circle (top half)
      lineCap="round"
      style={styles.progressContainer}
    >
      {() => (
        <View className="absolute inset-0 items-center justify-center">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            {ratingLabel}
          </Text>

          <AntDesign name="star" size={20} color="#F1C400" />
        </View>
      )}
    </AnimatedCircularProgress>
  );
};

export default RatingProgress;

const styles = StyleSheet.create({
  progressContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
