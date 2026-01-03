import { EvilIcons, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ShiftRequestModal from "../modals/ShiftRequestModal";

const BusinessShiftPending = ({
  title,
  status,
  selectedTab,
  approved,
  modal,
  setReject,
}: any) => {
  const [isFilterModal, setIsFilterModal] = useState(false);

  console.log(approved && selectedTab);

  const handleButton = (e: string) => {
    if (modal) {
      if (e === "reject") {
        modal();
        setReject(true);
      } else {
        modal();
        setReject(false);
      }
    }
  };

  return (
    <View>
      {title && (
        <Text className="text-xl font-proximanova-bold text-primary dark:text-dark-primary mt-5">
          {title}
        </Text>
      )}
      <View className="border border-[#eeeeee] rounded-xl p-2.5 mt-2.5">
        <View className="flex-row justify-between">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary ">
            June 09, 2025
          </Text>
          <Text
            className={`font-proximanova-regular text-sm text-primary dark:text-dark-primary py-0.5 px-3 rounded-full ${status === "Missed Clock-out" ? "bg-[#F34F4F4D]" : "bg-[#E5F4FD]"} `}
          >
            {status}
          </Text>
        </View>
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-1">
          09:00 AM to 1:00 PM
        </Text>
        {!(approved || selectedTab) && (
          <View className="flex-row gap-1 mt-2.5">
            <EvilIcons name="location" size={20} color="black" />
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              New York, North Bergen
            </Text>
          </View>
        )}
        <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2.5">
          {!(approved || selectedTab) && (
            <Text className="text-[#4FB2F3]">Reason{" :  "}</Text>
          )}
          {approved || selectedTab
            ? "Fever and body ache Medical checkup and recovery at home Fever and body ache Medical  "
            : " Unable to clock in due to poor internet connectivity at location."}
        </Text>
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ height: 2, width: 352, marginTop: 15 }}
        />
        <View className="flex-row justify-between items-center mt-2.5">
          <View className="flex-row gap-2 items-center">
            <Image
              source={require("@/assets/images/reward/nameplate-profile.png")}
              contentFit="contain"
              style={{ height: 40, width: 40 }}
            />
            <View>
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                Rohan Mehta
              </Text>
              <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                IT Support
              </Text>
            </View>
          </View>
          {selectedTab ? (
            <View className="flex-row gap-1.5">
              <TouchableOpacity className="h-10 w-10 bg-[#E5F4FD] rounded-full flex-row justify-center items-center">
                <Image
                  source={require("@/assets/images/messages-fill.svg")}
                  contentFit="contain"
                  style={{ height: 22, width: 22 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleButton("success")}
                className="h-10 w-10 bg-[#292D32] rounded-full flex-row justify-center items-center"
              >
                <Feather name="check" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleButton("reject")}
                className="h-10 w-10 bg-[#F34F4F] rounded-full flex-row justify-center items-center"
              >
                <EvilIcons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsFilterModal(true)}
              className={`py-2.5 px-3 rounded-full ${approved || "bg-[#11293A] "}`}
            >
              <Text className="font-proximanova-semibold text-sm text-white">
                Add Request
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <ShiftRequestModal
          onClose={() => setIsFilterModal(false)}
          visible={isFilterModal}
        />
      </View>
    </View>
  );
};

export default BusinessShiftPending;
