import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

const TimePicker = ({
  title,
  paddingy,
  marginx,
  rounded,
  value,
  onChangeTime,
}: {
  title?: string;
  paddingy?: number;
  marginx?: number;
  rounded?: number;
  value?: Date;
  onChangeTime?: (time: Date) => void;
}) => {
  const [time, setTime] = useState(value || new Date());
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedTime) {
      setTime(selectedTime);
      onChangeTime?.(selectedTime);
    }
  };
  const displayTime = value || time;
  const formattedTime = displayTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View className="flex-1">
      {title && (
        <Text className="mb-2.5 ml-1 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
          {title}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setShow(true)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between border border-gray-300  px-4 py-3 bg-white"
        style={{
          paddingVertical: paddingy || 12,
          marginHorizontal: marginx,
          borderRadius: rounded || 12,
        }}
      >
        <Text className=" text-base text-primary">
          {formattedTime ? formattedTime : title}
        </Text>
        <MaterialCommunityIcons name="clock" size={22} color="#4FB2F3" />
      </TouchableOpacity>

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={displayTime}
          mode="time"
          display="default"
          onChange={onChange}
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
                value={displayTime}
                mode="time"
                display="spinner"
                onChange={onChange}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default TimePicker;
