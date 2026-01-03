import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

const RatingStar = ({ rating }: { rating: number }) => {
  const blankStar = 5 - rating;

  return (
    <View>
      <View className="flex-row justify-center items-center mt-2.5 gap-1.5">
        {/* Filled stars */}
        {Array.from({ length: rating }, (_, index) => (
          <AntDesign
            name="star"
            key={`filled-${index}`}
            size={24}
            color="#F1C400"
          />
        ))}
        {Array.from({ length: blankStar }, (_, index) => (
          <AntDesign
            name="star"
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
