import { MonthPickerProps } from "@/types";
import { SimpleLineIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MonthPicker = ({ value, onDateChange, bgColor }: MonthPickerProps) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handleConfirm = () => {
    onDateChange(tempDate);
    setShow(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShow(false);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
      if (selectedDate) {
        onDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const formatMonth = (date: Date | null) => {
    if (!date) return "Month, Year";

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "2-digit",
    });
  };

  const getMaxDate = () => {
    return new Date(); // Allow up to current month
  };

  const getMinDate = () => {
    return new Date(2000, 0, 1); // Start from January 2000
  };

  return (
    <View>
      {/* Input Field */}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="flex-row items-center pl-2.5 pr-1.5 py-2 bg-[#F5F5F5] rounded-full"
        style={{ backgroundColor: bgColor }}
      >
        <Text
          className={`font-proximanova-regular text-sm ${value ? "text-primary" : "text-secondary"}`}
        >
          {formatMonth(value)}
        </Text>
        <SimpleLineIcons
          className="p-1.5"
          name="arrow-down"
          size={12}
          color="#111111"
        />
      </TouchableOpacity>

      {/* Android Native Picker */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onChange}
          minimumDate={getMinDate()}
          maximumDate={getMaxDate()}
        />
      )}

      {/* iOS Modal Picker */}
      {show && Platform.OS === "ios" && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={handleCancel}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              <SafeAreaView>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
                  <TouchableOpacity onPress={handleCancel}>
                    <Text className="text-blue-500 text-lg">Cancel</Text>
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold text-gray-900">
                    Select Month
                  </Text>
                  <TouchableOpacity onPress={handleConfirm}>
                    <Text className="text-blue-500 text-lg font-semibold">
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Date Picker */}
                <View className="px-6 py-4 items-center">
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onChange}
                    minimumDate={getMinDate()}
                    maximumDate={getMaxDate()}
                    style={{ height: 200 }}
                  />
                </View>
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default MonthPicker;
