import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useMemo, useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

const toYmd = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const UserCalendarScheduleModal = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}: any) => {
  const handleDone = () => {
    onClose();
  };
  const [localSelectedDate, setLocalSelectedDate] = useState(
    selectedDate || toYmd(new Date())
  );

  const effectiveSelectedDate = selectedDate || localSelectedDate;
  const markedDates = useMemo(
    () => ({
      [effectiveSelectedDate]: {
        selected: true,
        selectedColor: "#4FB2F3",
        selectedTextColor: "#FFFFFF",
      },
    }),
    [effectiveSelectedDate]
  );

  const handleSelectDate = (day: DateData) => {
    setLocalSelectedDate(day.dateString);
    if (typeof onSelectDate === "function") {
      onSelectDate(day.dateString);
    }
    onClose();
  };

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
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView className="px-5 py-5">
            <Calendar
              current={effectiveSelectedDate}
              markedDates={markedDates}
              onDayPress={handleSelectDate}
              enableSwipeMonths
              monthFormat={"MMMM yyyy"}
              theme={{
                textSectionTitleColor: "#4FB2F3",
                selectedDayBackgroundColor: "#4FB2F3",
                selectedDayTextColor: "#FFFFFF",
                todayTextColor: "#4FB2F3",
                dayTextColor: "#111111",
                textDisabledColor: "#D1D5DB",
                arrowColor: "#4FB2F3",
                monthTextColor: "#111111",
                indicatorColor: "#4FB2F3",
              }}
            />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default UserCalendarScheduleModal;

