import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SimpleLineIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

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
  onPress?: () => void;
  onTimeChange?: (time: string) => void;
};

const TimePicker = ({ time, onPress }: TimePickerProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
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

type WeeklyAvailabilityItem = {
  day: string;
  isOpen: boolean;
  startTime?: string;
  endTime?: string;
};

const DEFAULT_WEEK_SCHEDULE: WeekSchedule = {
  Monday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  Tuesday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  Wednesday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  Thursday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  Friday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  Saturday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
  Sunday: { isOn: false, startTime: "10:00 AM", endTime: "10:00 AM" },
};

const dayKeyMap: Record<string, keyof typeof DEFAULT_WEEK_SCHEDULE> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const formatApiTime = (value?: string) => {
  if (!value) return "10:00 AM";
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return value;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};

const parseDisplayTimeToDate = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  const date = new Date();

  if (!match) {
    date.setHours(10, 0, 0, 0);
    return date;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  const normalizedHour =
    meridiem === "PM" ? (hour % 12) + 12 : hour % 12;

  date.setHours(normalizedHour, minute, 0, 0);
  return date;
};

const formatDateToDisplayTime = (value: Date) => {
  const hour24 = value.getHours();
  const minute = `${value.getMinutes()}`.padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};

const isEndAfterStart = (startTime: string, endTime: string) => {
  const start = parseDisplayTimeToDate(startTime).getTime();
  const end = parseDisplayTimeToDate(endTime).getTime();
  return end > start;
};

const formatDisplayTimeToApi = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) return value;

  const hour12 = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3].toUpperCase();
  const hour24 =
    meridiem === "PM" ? (hour12 % 12) + 12 : hour12 % 12;

  return `${`${hour24}`.padStart(2, "0")}:${minute}`;
};

const mapScheduleToAvailability = (
  currentSchedule: WeekSchedule
): WeeklyAvailabilityItem[] =>
  Object.entries(currentSchedule).map(([day, value]) => ({
    day: day.toLowerCase(),
    isOpen: value.isOn,
    ...(value.isOn
      ? {
          startTime: formatDisplayTimeToApi(value.startTime),
          endTime: formatDisplayTimeToApi(value.endTime),
        }
      : {}),
  }));

const mapAvailabilityToSchedule = (
  availability?: WeeklyAvailabilityItem[]
): WeekSchedule => {
  const nextSchedule: WeekSchedule = JSON.parse(JSON.stringify(DEFAULT_WEEK_SCHEDULE));

  if (!Array.isArray(availability) || availability.length === 0) {
    return nextSchedule;
  }

  availability.forEach((item) => {
    const mappedDay = dayKeyMap[item.day?.toLowerCase?.() || ""];
    if (!mappedDay) return;

    nextSchedule[mappedDay] = {
      isOn: Boolean(item.isOpen),
      startTime: formatApiTime(item.startTime),
      endTime: formatApiTime(item.endTime),
    };
  });

  return nextSchedule;
};

// Main WeeklySchedule Component
const WeeklySchedule = ({
  business,
  availability,
  onChange,
}: {
  business?: boolean;
  availability?: WeeklyAvailabilityItem[];
  onChange?: (availability: WeeklyAvailabilityItem[]) => void;
}) => {
  const initialSchedule = useMemo(
    () => mapAvailabilityToSchedule(availability),
    [availability]
  );
  const [schedule, setSchedule] = useState<WeekSchedule>(initialSchedule);
  const [pickerState, setPickerState] = useState<{
    day: string;
    timeType: "startTime" | "endTime";
  } | null>(null);

  useEffect(() => {
    setSchedule(initialSchedule);
  }, [initialSchedule]);

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const nextIsOn = !prev[day].isOn;
      const nextDaySchedule = {
        ...prev[day],
        isOn: nextIsOn,
        ...(nextIsOn && !isEndAfterStart(prev[day].startTime, prev[day].endTime)
          ? {
              startTime: "9:00 AM",
              endTime: "5:00 PM",
            }
          : {}),
      };
      const nextSchedule = {
        ...prev,
        [day]: nextDaySchedule,
      };
      onChange?.(mapScheduleToAvailability(nextSchedule));
      return nextSchedule;
    });
  };

  const updateTime = (
    day: string,
    timeType: "startTime" | "endTime",
    newTime: string
  ) => {
    setSchedule((prev) => {
      const nextSchedule = {
        ...prev,
        [day]: { ...prev[day], [timeType]: newTime },
      };
      onChange?.(mapScheduleToAvailability(nextSchedule));
      return nextSchedule;
    });
  };

  const activePickerDate = pickerState
    ? parseDisplayTimeToDate(schedule[pickerState.day]?.[pickerState.timeType])
    : new Date();

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (!pickerState) return;

    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setPickerState(null);
        return;
      }

      if (selectedDate) {
        updateTime(
          pickerState.day,
          pickerState.timeType,
          formatDateToDisplayTime(selectedDate)
        );
      }
      setPickerState(null);
      return;
    }

    if (selectedDate) {
      updateTime(
        pickerState.day,
        pickerState.timeType,
        formatDateToDisplayTime(selectedDate)
      );
    }
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
              onPress={() => setPickerState({ day, timeType: "startTime" })}
            />
            <Text className="text-xs text-primary dark:text-dark-primary">
              to
            </Text>
            <TimePicker
              time={dayData.endTime}
              onPress={() => setPickerState({ day, timeType: "endTime" })}
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

      {pickerState ? (
        <DateTimePicker
          value={activePickerDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
};

export default WeeklySchedule;
