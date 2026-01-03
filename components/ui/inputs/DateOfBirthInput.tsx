import { DateOfBirthInputProps } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DateOfBirthInput = ({ value, onDateChange }: DateOfBirthInputProps) => {
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

  const formatDate = (date: Date | null) => {
    if (!date) return "dd/mm/yyyy";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  };

  // In DateOfBirthInput component, you could make these configurable:
  const getMaxDate = () => {
    return new Date(); // For work dates, allow up to today
  };

  const getMinDate = () => {
    return new Date(1950, 0, 1); // Reasonable work start date
  };

  return (
    <View>
      {/* Input Field */}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="w-full px-3 py-4 bg-white rounded-[10px] border border-[#EEEEEE]"
      >
        <Text
          className={`text-sm ${value ? "text-primary" : "text-secondary"}`}
        >
          {formatDate(value)}
        </Text>
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
                  <Text className="text-lg font-proximanova-semibold text-gray-900">
                    Select Date of Birth
                  </Text>
                  <TouchableOpacity onPress={handleConfirm}>
                    <Text className="text-blue-500 text-lg font-proximanova-semibold">
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

export default DateOfBirthInput;
