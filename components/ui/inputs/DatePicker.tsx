import { FontAwesome6 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

const DatePicker = ({
  className,
  title,
  value,
  onChange: onDateChange,
}: {
  className?: any;
  title?: string;
  value?: Date;
  onChange?: (date: Date) => void;
}) => {
  const [internalDate, setInternalDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const date = value || internalDate;

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (!selectedDate) return;
    setInternalDate(selectedDate);
    onDateChange?.(selectedDate);
  };

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={() => setShow(true)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-white"
      >
        <Text className="text-gray-700 text-base">
          {formattedDate ? formattedDate : title}
        </Text>
        <FontAwesome6 name="calendar-days" size={20} color="#4FB2F3" />
      </TouchableOpacity>

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShow(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 24,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={{ color: "#6B7280", fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={{ color: "#4FB2F3", fontSize: 16, fontWeight: "600" }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default DatePicker;
