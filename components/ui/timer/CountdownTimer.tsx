import { CountdownTimerProps, TimeLeft } from "@/types";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  className,
  targetTime,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const calculateTimeLeft = (): TimeLeft => {
    const target = new Date(targetTime).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetTime]);

  const totalHours = timeLeft.total / (1000 * 60 * 60);
  const isExpired = timeLeft.total <= 0;
  const isWarning = totalHours <= 1 && !isExpired;
  const isNormal = totalHours > 1;

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <View className="items-center">
      <View className="relative w-[60px] h-[60px] items-center justify-center">
        {/* Red - Expired */}
        {isExpired && (
          <Image
            source={require("@/assets/images/countdown-red.svg")}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        )}

        {/* Yellow - Warning (≤1 hour) */}
        {isWarning && (
          <Image
            source={require("@/assets/images/countdown-yellow.svg")}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        )}

        {/* Blue - Normal (>1 hour) */}
        {isNormal && (
          <Image
            source={require("@/assets/images/countdown-blue.svg")}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        )}

        {/* Text Color - Red */}
        {isExpired && (
          <Text className="text-3xl font-proximanova-bold text-red-500 dark:text-red-400 absolute">
            {value.toString().padStart(2, "0")}
          </Text>
        )}

        {/* Text Color - Yellow */}
        {isWarning && (
          <Text className="text-3xl font-proximanova-bold text-yellow-500 dark:text-yellow-400 absolute">
            {value.toString().padStart(2, "0")}
          </Text>
        )}

        {/* Text Color - Blue */}
        {isNormal && (
          <Text className="text-3xl font-proximanova-bold text-blue-500 dark:text-blue-400 absolute">
            {value.toString().padStart(2, "0")}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View className={`${className} flex-row justify-center items-center`}>
      <View className="flex items-center">
        <TimeUnit value={timeLeft.hours} label="hours" />
        <Text className="text-xs text-primary dark:text-dark-primary mt-2 font-proximanova-regular">
          Hours
        </Text>
      </View>

      <Text className="text-2xl font-proximanova-bold text-gray-400 mx-4">
        :
      </Text>

      <View className="flex items-center">
        <TimeUnit value={timeLeft.minutes} label="minutes" />
        <Text className="text-xs text-primary dark:text-dark-primary mt-2 font-proximanova-regular">
          Minutes
        </Text>
      </View>

      <Text className="text-2xl font-proximanova-bold text-gray-400 mx-4">
        :
      </Text>

      <View className="flex items-center">
        <TimeUnit value={timeLeft.seconds} label="seconds" />
        <Text className="text-xs text-primary dark:text-dark-primary mt-2 font-proximanova-regular">
          Seconds
        </Text>
      </View>
    </View>
  );
};

export default CountdownTimer;
