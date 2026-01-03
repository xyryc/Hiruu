import { Entypo, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";
import TimePicker from "../inputs/TimePicker";

const hourLimitData = [
  {
    name: "weekly",
  },
  {
    name: "monthly",
  },
  {
    name: "per-day",
  },
];

const WorkingHourSettingsModal: React.FC<any> = ({ visible, onClose }) => {
  const [selectCheck, setSelectCheck] = useState("");
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]}>
            <View className="py-7 px-5">
              <Text className="text-center font-proximanova-bold text-xl">
                Working Hour Settings
              </Text>

              {/* Hours limite  */}
              <View className="mt-8">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary ">
                  Hours Limit by
                </Text>

                {/* Hours limite cheak mark  */}
                <View className="flex-row gap-2 mt-4">
                  {hourLimitData.map((item) => (
                    <TouchableOpacity
                      onPress={() => setSelectCheck(item.name)}
                      key={item.name}
                      className=" py-2 rounded-full flex-row justify-center gap-2.5"
                    >
                      <View
                        className={`h-5 w-5 border border-secondary dark:border-dark-secondary rounded-full flex-row justify-center items-center ${selectCheck === item.name && "bg-[#11293A]"} `}
                      >
                        {selectCheck === item.name && (
                          <Feather name="check" size={15} color="white" />
                        )}
                      </View>
                      <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary capitalize">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* time picker */}
              <View className="flex-row justify-between items-center mt-5 gap-2.5">
                <TimePicker title="Min" />

                <TimePicker title="mix" />
              </View>

              <PrimaryButton title="Apply" className="mt-6" />
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default WorkingHourSettingsModal;
