import { ShiftHeaderProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BusinessSelectionTrigger from "../ui/dropdown/BusinessSelectionTrigger";
import UserCalendarScheduleModal from "../ui/modals/UserCalendarScheduleModal";

const ShiftHeader = ({
  setShowModal,
  displayContent,
  selectedDate,
  onSelectDate,
}: ShiftHeaderProps) => {
  const [isCalenderModal, setCalenderModal] = useState(false);
  const effectiveSelectedDate = selectedDate || (() => {
    const value = new Date();
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    const day = `${value.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const displayDate = useMemo(() => {
    const value = new Date(`${effectiveSelectedDate}T00:00:00`);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(value);
  }, [effectiveSelectedDate]);

  const displayWeekdayDate = useMemo(() => {
    const value = new Date(`${effectiveSelectedDate}T00:00:00`);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(value);
  }, [effectiveSelectedDate]);

  return (
    <View className="px-5 pb-4 pt-2.5">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className="font-proximanova-regular text-primary dark:text-dark-primary">
            All Shift
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xl font-proximanova-bold text-primary dark:text-dark-primary">
              {displayDate}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color="#666"
              className="ml-2.5"
            />
          </View>
        </View>

        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={() => setCalenderModal(true)}
            className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="calendar-outline" size={20} color="#111111" />
          </TouchableOpacity>

          {/* notification */}
          <TouchableOpacity
            onPress={() => router.push("/screens/notifications/list")}
            className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full w-10 h-10 items-center justify-center"
          >
            <Image
              source={require("@/assets/images/bell.svg")}
              style={{
                width: 20,
                height: 20,
              }}
              contentFit="contain"
            />
            <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
              <Text className="text-[10px] text-white">4</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-7">
        <Text className="text-lg font-proximanova-semibold text-primary dark:text-dark-primary">
          {displayWeekdayDate}
        </Text>

        <BusinessSelectionTrigger
          displayContent={displayContent as any}
          onPress={() => setShowModal(true)}
          compact
        />

        <UserCalendarScheduleModal
          visible={isCalenderModal}
          onClose={() => setCalenderModal(false)}
          selectedDate={effectiveSelectedDate}
          onSelectDate={onSelectDate}
        />
      </View>
    </View>
  );
};

export default ShiftHeader;
