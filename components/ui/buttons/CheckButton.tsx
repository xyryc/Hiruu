import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CheckButton = ({
  className,
  title,
}: {
  className?: string;
  title: string;
}) => {
  const [isCheck2, setIsCheck2] = useState(false);
  const [isCheck1, setIsCheck1] = useState(false);

  return (
    <View
      className={` ${className} flex-row items-center justify-between mt-4`}
    >
      <Text
        className="font-proximanova-regular text-sm text-primary dark:text-dark-primary"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="flex-row items-center gap-10">
        <TouchableOpacity
          onPress={() => setIsCheck1(!isCheck1)}
          className={`h-5 w-5 rounded-full border border-[#7A7A7A]  ${isCheck1 ? "bg-[#11293A]" : ""} `}
        >
          {isCheck1 && <Feather name="check" size={15} color="white" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsCheck2(!isCheck2)}
          className={`h-5 w-5 rounded-full border border-[#7A7A7A]  ${isCheck2 ? "bg-[#11293A]" : ""} `}
        >
          {isCheck2 && <Feather name="check" size={15} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckButton;
