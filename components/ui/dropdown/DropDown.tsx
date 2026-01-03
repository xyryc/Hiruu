import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

const Dropdown = ({
  label,
  placeholder,
  options,
  value,
  onSelect,
  className,
  fontSize,
}: any) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (item: any) => {
    onSelect(item);
    setIsVisible(false);
  };

  return (
    <View className={className}>
      {label && (
        <Text
          className="font-proximanova-medium text-primary dark:text-dark-primary mb-2.5"
          style={{ fontSize: fontSize | 14 }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="flex-row items-center justify-between px-3 py-3 bg-white dark:bg-dark-surface rounded-[10px] border border-[#EEEEEE] dark:border-dark-border"
      >
        <Text
          className={`text-sm font-proximanova-regular ${
            value
              ? "text-primary dark:text-dark-primary"
              : "text-placeholder dark:text-dark-placeholder"
          }`}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#7D7D7D" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white dark:bg-dark-surface rounded-t-3xl">
            <View className="px-5 py-4 border-b border-gray-200 dark:border-dark-border">
              <Text className="text-lg font-proximanova-semibold text-primary dark:text-dark-primary text-center">
                {label || "Select Option"}
              </Text>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className="p-5 border-b border-gray-100 dark:border-dark-border/50"
                >
                  <Text className="text-base font-proximanova-regular text-primary dark:text-dark-primary">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;
