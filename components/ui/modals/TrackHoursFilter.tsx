import { EvilIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TrackHoursFilter = ({ visible, onClose }: any) => {
  const handleDone = () => {
    onClose();
  };

  const timefreameData = [
    {
      name: "all time",
      id: 1,
    },
    {
      name: "this week",
      id: 2,
    },
    {
      name: "this month",
      id: 3,
    },
    {
      name: "last six month",
      id: 4,
    },
    {
      name: "this year",
      id: 5,
    },
  ];

  const [isSelectTime, setIsSelectTime] = useState<Number>(0);

  const handleSelected = (index: number) => {
    setIsSelectTime(index);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <EvilIcons name="close" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7 ">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="">
                {/* title*/}
                <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary text-center">
                  Select Timeframe
                </Text>

                {/* Select Timeframe */}

                <View className="">
                  {timefreameData.map((item, index) => (
                    <TouchableOpacity
                      onPress={() => handleSelected(index)}
                      key={index}
                      className={`items-center py-2.5 ${index === 0 || "border-t border-[#EEEEEE]"}`}
                    >
                      <View
                        className={`  py-3 px-5  ${isSelectTime === index ? "bg-[#4FB2F3] rounded-full" : ""} `}
                      >
                        <Text
                          className={`capitalize text-center font-proximanova-semibold  ${isSelectTime === index ? "text-white " : "text-primary dark:text-dark-primary"} `}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>

          <SafeAreaView
            edges={["bottom"]}
            className="flex-1 px-5 py-7 justify-center"
          ></SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default TrackHoursFilter;
