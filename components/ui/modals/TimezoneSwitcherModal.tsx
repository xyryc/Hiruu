import {
  TIMEZONE_OPTIONS,
  getTimezoneLabel,
  getTimezoneOffsetLabel,
} from "@/constants/timezones";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { getDeviceTimezone } from "@/utils/date";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TimezoneSwitcherModalProps = {
  visible: boolean;
  onClose: () => void;
};

const TimezoneSwitcherModal = ({
  visible,
  onClose,
}: TimezoneSwitcherModalProps) => {
  const timezone = usePreferencesStore((state) => state.timezone);
  const setTimezone = usePreferencesStore((state) => state.setTimezone);
  const resetTimezoneToDevice = usePreferencesStore(
    (state) => state.resetTimezoneToDevice
  );

  const deviceTimezone = getDeviceTimezone();

  const handleSelect = (value: string) => {
    setTimezone(value);
    onClose();
  };

  const handleUseDeviceTimezone = () => {
    resetTimezoneToDevice();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[70%]">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#00000090] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <Text className="text-xl font-proximanova-bold text-center text-primary mb-4">
              Select Timezone
            </Text>

            <TouchableOpacity
              onPress={handleUseDeviceTimezone}
              className="bg-[#E5F4FD] rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
            >
              <View>
                <Text className="font-proximanova-semibold text-primary">
                  Use device timezone
                </Text>
                <Text className="text-sm text-secondary mt-1">
                  {getTimezoneLabel(deviceTimezone)} ({getTimezoneOffsetLabel(deviceTimezone)})
                </Text>
              </View>

              {timezone === deviceTimezone && (
                <Ionicons name="checkmark-circle" size={22} color="#4FB2F3" />
              )}
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
            >
              {TIMEZONE_OPTIONS.map((option) => {
                const selected = option.value === timezone;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={`flex-row items-center justify-between px-4 py-4 rounded-xl mb-3 ${selected ? "bg-[#E5F4FD]" : "bg-gray-50"
                      }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className={`font-proximanova-semibold ${selected ? "text-[#4FB2F3]" : "text-primary"
                          }`}
                      >
                        {option.label} ({getTimezoneOffsetLabel(option.value)})
                      </Text>
                      <Text className="text-xs text-secondary mt-1">
                        {option.value}
                      </Text>
                    </View>

                    {selected && (
                      <Ionicons name="checkmark-circle" size={22} color="#4FB2F3" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default TimezoneSwitcherModal;
