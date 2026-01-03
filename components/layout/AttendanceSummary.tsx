import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AttendanceSummary = ({ className }: { className: string }) => {
  return (
    <View className={className}>
      <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
        Today’s Attendance Summary
      </Text>

      <View className="relative mt-4 overflow-hidden">
        {/* background */}
        <Image
          source={require("@/assets/images/AttendanceSummary.svg")}
          style={{
            width: "100%",
            height: 141,
          }}
          contentFit="fill"
        />

        {/* content */}
        <View className="absolute top-0 left-0 w-full px-3">
          <TouchableOpacity className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center  gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#3EBF5A]" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                Employees Arrived On Time
              </Text>
            </View>
            <View className="flex-row gap-2.5 items-center">
              <Text className="font-proximanova-bold text-primary dark:text-dark-primary">
                45
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={10}
                color="#11293A33"
              />
            </View>
          </TouchableOpacity>

          <Image
            source={require("@/assets/images/dotted-line.svg")}
            style={{
              width: "100%",
              height: 1,
            }}
            contentFit="contain"
          />

          <TouchableOpacity className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center  gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#F3934F]" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                Late Comers Today
              </Text>
            </View>
            <View className="flex-row gap-2.5 items-center">
              <Text className="font-proximanova-bold text-primary dark:text-dark-primary">
                06
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={10}
                color="#11293A33"
              />
            </View>
          </TouchableOpacity>

          <Image
            source={require("@/assets/images/dotted-line.svg")}
            style={{
              width: "100%",
              height: 1,
            }}
            contentFit="contain"
          />

          <TouchableOpacity className="flex-row justify-between items-center p-4 ">
            <View className="flex-row items-center  gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#F34F4F]" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                Absent Employees Today
              </Text>
            </View>
            <View className="flex-row gap-2.5 items-center">
              <Text className="font-proximanova-bold text-primary dark:text-dark-primary">
                03
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={10}
                color="#11293A33"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AttendanceSummary;
