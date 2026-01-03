import { SimpleLineIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// ToggleButton Component
type ToggleButtonProps = {
  isOn: boolean;
  setIsOn: (value: boolean) => void;
  className?: string;
};

const ToggleButton = ({ isOn, setIsOn, className = "" }: ToggleButtonProps) => {
  return (
    <TouchableOpacity
      onPress={() => setIsOn(!isOn)}
      className={`w-11 h-6 rounded-full p-0.5 justify-center ${
        isOn ? "bg-green-500" : "bg-gray-300"
      } ${className}`}
    >
      <View
        className={`w-5 h-5 rounded-full bg-white ${
          isOn ? "self-end" : "self-start"
        }`}
      />
    </TouchableOpacity>
  );
};

// TimePicker Component
type TimePickerProps = {
  time: string;
  onTimeChange?: (time: string) => void;
};

const TimePicker = ({ time, onTimeChange }: TimePickerProps) => {
  return (
    <TouchableOpacity
      onPress={() => {
        // আপনার time picker modal open করুন
        console.log("Open time picker for:", time);
        // onTimeChange?.('11:00 AM') // example
      }}
      className="flex-row items-center bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 px-2 py-1.5 rounded-full"
    >
      <Text className="text-xs text-primary dark:text-dark-primary">
        {time}
      </Text>
      <Text className="text-[10px] text-gray-600 dark:text-gray-400 ml-1">
        ▼
      </Text>
    </TouchableOpacity>
  );
};

// Schedule type
type DaySchedule = {
  isOn: boolean;
  startTime: string;
  endTime: string;
};

type WeekSchedule = {
  [key: string]: DaySchedule;
};

// Main WeeklySchedule Component
const WeeklySchedule = ({ business }: { business?: boolean }) => {
  const [schedule, setSchedule] = useState<WeekSchedule>({
    Monday: { isOn: true, startTime: "10:00 AM", endTime: "10:00 AM" },
    Tuesday: { isOn: true, startTime: "10:00 AM", endTime: "10:00 AM" },
    Wednesday: { isOn: true, startTime: "10:00 AM", endTime: "10:00 AM" },
    Thursday: { isOn: true, startTime: "10:00 AM", endTime: "10:00 AM" },
    Friday: { isOn: true, startTime: "10:00 AM", endTime: "10:00 AM" },
    Saturday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
    Sunday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  });

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOn: !prev[day].isOn },
    }));
  };

  const updateTime = (
    day: string,
    timeType: "startTime" | "endTime",
    newTime: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [timeType]: newTime },
    }));
  };

  const renderDayRow = (day: string) => {
    const dayData = schedule[day];

    return (
      <View key={day} className="flex-row items-center justify-between mb-4">
        {/* Left side: Day name + Toggle */}
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-medium text-primary dark:text-dark-primary w-20">
            {day}
          </Text>

          {/* <ToggleButton isOn={dayData.isOn} setIsOn={() => toggleDay(day)} /> */}
        </View>

        {/* Right side: Time pickers or Closed */}
        {dayData.isOn ? (
          <View className="flex-row items-center gap-2">
            <ToggleButton isOn={dayData.isOn} setIsOn={() => toggleDay(day)} />

            <TimePicker
              time={dayData.startTime}
              onTimeChange={(time) => updateTime(day, "startTime", time)}
            />
            <Text className="text-xs text-primary dark:text-dark-primary">
              to
            </Text>
            <TimePicker
              time={dayData.endTime}
              onTimeChange={(time) => updateTime(day, "endTime", time)}
            />
          </View>
        ) : (
          <View className="flex-row items-center gap-4">
            <Text className="text-xs font-proximanova-semibold text-[#F34F4F]">
              Closed
            </Text>
            <ToggleButton isOn={dayData.isOn} setIsOn={() => toggleDay(day)} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="bg-white dark:bg-dark-background rounded-xl p-4 border border-[#EEEEEE]">
      {business && (
        <View className="flex-row justify-between mb-5 rounded-xl">
          <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
            Available Working Days
          </Text>

          <SimpleLineIcons name="arrow-down" size={16} color="black" />
        </View>
      )}

      {Object.keys(schedule).map((day) => renderDayRow(day))}
    </View>
  );
};

export default WeeklySchedule;
