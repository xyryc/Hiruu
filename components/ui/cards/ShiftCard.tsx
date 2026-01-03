import { FontAwesome6, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";

const ShiftCard = ({ shift }) => {
  return (
    <View
      key={shift.id}
      className="border border-[#EEEEEE] rounded-xl p-4 mb-4"
    >
      {/* 1st row */}
      <View className="flex-row justify-between items-start">
        {/* profile pic, name */}
        <View className="flex-row gap-2.5">
          <Image
            className="mr-2.5"
            source={{ uri: shift.avatar }}
            style={{ width: 42, height: 42, borderRadius: 999 }}
          />

          <View className="">
            <Text className="text-base font-proximanova-bold text-primary">
              {shift.name}
            </Text>

            <Text className="text-sm font-proximanova-regular text-gray-600 mb-3">
              {shift.role}
            </Text>
          </View>
        </View>

        {/* icons */}
        <View className="flex-row items-center gap-1.5">
          <View className="bg-[#E5F4FD] p-2 rounded-full">
            <Image
              source={require("@/assets/images/messages-fill.svg")}
              contentFit="contain"
              style={{ height: 22, width: 22 }}
            />
          </View>

          <SimpleLineIcons name="options-vertical" size={14} color="black" />
        </View>
      </View>

      {/* 2nd row */}
      <View className="my-4">
        <View className="flex-row justify-between mb-2.5">
          <Text className="text-sm font-proximanova-regular text-secondary">
            Shift Time:
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary">
            6:00 AM - 2:00 PM
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm font-proximanova-regular text-secondary">
            Shift Time:
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary">
            6:00 AM - 2:00 PM
          </Text>
        </View>
      </View>

      {/* line*/}
      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{
          width: "100%",
          height: 1,
        }}
        contentFit="cover"
      />

      {/* 3rd row */}
      <View className="mt-2.5 flex-row justify-between items-center">
        {/* view details */}
        <TouchableOpacity className="flex-row items-center gap-1">
          <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
            View Details
          </Text>
          <FontAwesome6 name="arrow-right-long" size={14} color="#4FB2F3" />
        </TouchableOpacity>

        {/* status */}
        <StatusBadge status={shift?.status} />
      </View>
    </View>
  );
};

export default ShiftCard;
