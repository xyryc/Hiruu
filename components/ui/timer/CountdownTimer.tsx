import { CountdownTimerProps, TimeLeft } from "@/types";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

const CountdownTimer = ({
  className,
  targetTime,
  onComplete,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const target = new Date(targetTime).getTime();
    const now = Date.now();

    if (!Number.isFinite(target)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

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
  }, [targetTime]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const next = calculateTimeLeft();
      setTimeLeft(next);

      if (next.total <= 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onComplete]);

  const totalHours = timeLeft.total / (1000 * 60 * 60);
  const isExpired = timeLeft.total <= 0;
  const isWarning = totalHours <= 1 && !isExpired;

  const timerRingSource = useMemo(() => {
    if (isExpired) return require("@/assets/images/countdown-red.svg");
    if (isWarning) return require("@/assets/images/countdown-yellow.svg");
    return require("@/assets/images/countdown-blue.svg");
  }, [isExpired, isWarning]);

  const timerTextClass = useMemo(() => {
    if (isExpired) return "text-red-500 dark:text-red-400";
    if (isWarning) return "text-yellow-500 dark:text-yellow-400";
    return "text-blue-500 dark:text-blue-400";
  }, [isExpired, isWarning]);

  const TimeUnit = ({ value }: { value: number }) => (
    <View className="items-center">
      <View className="relative w-[60px] h-[60px] items-center justify-center">
        <Image
          source={timerRingSource}
          style={{ width: 60, height: 60 }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
        />
        <Text className={`text-3xl font-proximanova-bold absolute ${timerTextClass}`}>
          {value.toString().padStart(2, "0")}
        </Text>
      </View>
    </View>
  );

  return (
    <View className={`${className} flex-row justify-center items-center`}>
      <View className="flex items-center">
        <TimeUnit value={timeLeft.hours} />
        <Text className="text-xs text-primary dark:text-dark-primary mt-2 font-proximanova-regular">
          Hours
        </Text>
      </View>

      <Text className="text-2xl font-proximanova-bold text-gray-400 mx-4">:</Text>

      <View className="flex items-center">
        <TimeUnit value={timeLeft.minutes} />
        <Text className="text-xs text-primary dark:text-dark-primary mt-2 font-proximanova-regular">
          Minutes
        </Text>
      </View>

      <Text className="text-2xl font-proximanova-bold text-gray-400 mx-4">:</Text>

      <View className="flex items-center">
        <TimeUnit value={timeLeft.seconds} />
        <Text className="text-xs text-primary dark:text-dark-primary mt-2 font-proximanova-regular">
          Seconds
        </Text>
      </View>
    </View>
  );
};

export default CountdownTimer;
