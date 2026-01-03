import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ToggleButton } from "../buttons/ToggleButton";

const NotificationPreferencesInpute = ({
  setIsToggle,
  settingsConfig,
  settings,
  toggleSetting,
  isToggle,
  title,
}: any) => {
  return (
    <View>
      {/* title title title */}
      <View className="flex-row justify-between items-center mt-7 px-4 py-2.5 border border-[#EEEEEE] rounded-xl">
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
          {title}
        </Text>
        <ToggleButton setIsOn={setIsToggle} isOn={isToggle} />
      </View>
      {/* title title title */}

      {/* check theck check theck */}
      <View className="border mt-2.5 border-[#EEEEEE] rounded-xl p-4">
        {settingsConfig.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            className="flex-row justify-between py-2.5"
            onPress={() => toggleSetting(item.key)}
          >
            <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
              {item.label}
            </Text>
            <View>
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  settings[item.key]
                    ? "bg-blue-600"
                    : "bg-white border-2 border-gray-300"
                }`}
              >
                {settings[item.key] && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {/* check theck check theck */}
    </View>
  );
};

export default NotificationPreferencesInpute;
