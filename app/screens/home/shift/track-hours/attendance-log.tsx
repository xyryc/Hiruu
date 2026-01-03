import ScreenHeader from "@/components/header/ScreenHeader";
import AttendanceLogCard from "@/components/ui/cards/AttendanceLogCard";
import TrackHoursFilter from "@/components/ui/modals/TrackHoursFilter";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AttendanceLog = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isModal, setIsModal] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5 my-2.5"
        onPressBack={() => router.back()}
        title="Attendance Log"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center bg-[#F5F5F5] rounded-full"
            onPress={() => setIsModal(true)}
          >
            <Feather name="filter" size={16} color="#292D32" />
          </TouchableOpacity>
        }
      />
      <View className="mx-5 mt-8 ">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <View>
            <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
              09 june 2025
            </Text>
            <AttendanceLogCard
              startTime="10:00"
              endTime="01:00"
              totalWorkTime="03:00:00"
              workTimeColor="#3EBF5A"
              status="accepted"
              statusLabel="Overtime"
            />
            <AttendanceLogCard
              startTime="12:30"
              endTime="15:00"
              totalWorkTime="02:30:00"
              workTimeColor="#F34F4F"
              status="rejected"
              statusLabel="Late Entry"
            />
          </View>
          <View className="mt-8">
            <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
              08 june 2025
            </Text>
            <AttendanceLogCard
              startTime="10:00"
              endTime="11:00"
              totalWorkTime="1:00:00"
            />
            <AttendanceLogCard
              startTime="00:00"
              endTime="00:00"
              totalWorkTime="00:00:00"
              workTimeColor="#F3934F"
              status="pending"
              statusLabel="Absent"
            />
          </View>
          <View className="mt-8">
            <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
              07 june 2025
            </Text>
            <AttendanceLogCard
              startTime="10:00"
              endTime="01:00"
              totalWorkTime="03:00:00"
              workTimeColor="#3EBF5A"
              status="accepted"
              statusLabel="Overtime"
            />
            <AttendanceLogCard
              startTime="00:00"
              endTime="00:00"
              totalWorkTime="00:00:00"
              workTimeColor="#F3934F"
              status="pending"
              statusLabel="Absent"
            />
          </View>
        </ScrollView>
      </View>

      <TrackHoursFilter visible={isModal} onClose={() => setIsModal(false)} />
    </SafeAreaView>
  );
};

export default AttendanceLog;
