import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

const RatingStar = ({ rating }: { rating: number }) => {
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View>
      <View className="flex-row justify-center items-center mt-2.5 gap-1.5">
        {Array.from({ length: fullStars }, (_, index) => (
          <MaterialIcons
            name="star"
            key={`filled-${index}`}
            size={24}
            color="#F1C400"
          />
        ))}

        {hasHalfStar ? (
          <MaterialIcons
            name="star-half"
            key="half-star"
            size={24}
            color="#F1C400"
          />
        ) : null}

        {Array.from({ length: emptyStars }, (_, index) => (
          <MaterialIcons
            name="star-outline"
            key={`empty-${index}`}
            size={24}
            color="#EEEEEE"
          />
        ))}
      </View>
    </View>
  );
};

export default RatingStar;
