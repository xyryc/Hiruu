import { MonthPickerProps } from "@/types";
import { EvilIcons, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MonthPicker = ({ value, onDateChange, bgColor }: MonthPickerProps) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    if (show) {
      setTempDate(value || new Date());
      setShowYearPicker(false);
    }
  }, [show, value]);

  const months = useMemo(
    () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 31 }, (_, index) => currentYear - 15 + index);
  }, []);

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShow(false);
  };

  const formatMonth = (date: Date | null) => {
    if (!date) return "Month, Year";

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "2-digit",
    });
  };

  const setTempYear = (year: number) => {
    setTempDate((prev) => new Date(year, prev.getMonth(), 1));
  };

  const changeTempYear = (delta: number) => {
    setTempYear(tempDate.getFullYear() + delta);
  };

  const selectMonth = (monthIndex: number) => {
    const selected = new Date(tempDate.getFullYear(), monthIndex, 1);
    setTempDate(selected);
    onDateChange(selected);
    setShow(false);
  };

  return (
    <View>
      {/* Input Field */}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="flex-row items-center"
        style={{ backgroundColor: bgColor }}
      >
        <Text
          className={`font-proximanova-regular text-sm ${value ? "text-primary" : "text-secondary"}`}
        >
          {formatMonth(value)}
        </Text>
        <SimpleLineIcons
          className="p-1.5"
          name="arrow-down"
          size={12}
          color="#111111"
        />
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade" onRequestClose={handleCancel}>
        <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
          <TouchableOpacity activeOpacity={1} onPress={handleCancel} className="absolute inset-0" />

          <View className="bg-white rounded-t-3xl">
            <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
              <TouchableOpacity onPress={handleCancel}>
                <View className="bg-[#1f1f1f] rounded-full p-2.5">
                  <EvilIcons name="close" size={30} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <SafeAreaView edges={["bottom"]} className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => changeTempYear(-1)} className="p-2">
                  <Ionicons name="chevron-back" size={24} color="#202020" />
                </TouchableOpacity>

                <View className="flex-row gap-2">
                  <View className="px-4 py-2 rounded-full bg-[#E5F4FD]">
                    <Text className="font-proximanova-semibold text-lg text-primary capitalize">
                      {months[tempDate.getMonth()]}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowYearPicker((prev) => !prev)}
                    className="px-4 py-2 rounded-full bg-[#E5F4FD] flex-row items-center gap-1.5"
                  >
                    <Text className="font-proximanova-semibold text-lg text-primary">
                      {tempDate.getFullYear()}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#202020" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => changeTempYear(1)} className="p-2">
                  <Ionicons name="chevron-forward" size={24} color="#202020" />
                </TouchableOpacity>
              </View>

              {showYearPicker ? (
                <View className="mb-4 border border-[#EEEEEE] rounded-2xl p-2.5 max-h-[120px]">
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap gap-2 justify-center">
                      {years.map((year) => {
                        const active = year === tempDate.getFullYear();
                        return (
                          <TouchableOpacity
                            key={year}
                            onPress={() => {
                              setTempYear(year);
                              setShowYearPicker(false);
                            }}
                            className={`px-4 py-2 rounded-full border ${active ? "bg-[#4FB2F3] border-[#4FB2F3]" : "bg-white border-[#E5E7EB]"
                              }`}
                          >
                            <Text
                              className={`font-proximanova-semibold text-sm ${active ? "text-white" : "text-primary"
                                }`}
                            >
                              {year}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              ) : null}

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {months.map((month, index) => {
                  const active = index === tempDate.getMonth();
                  return (
                    <TouchableOpacity
                      key={month}
                      onPress={() => selectMonth(index)}
                      className={`w-[23%] h-16 rounded-2xl border items-center justify-center ${active ? "bg-[#4FB2F3] border-[#4FB2F3]" : "bg-white border-[#E5E7EB]"
                        }`}
                    >
                      <Text
                        className={`font-proximanova-semibold text-xl ${active ? "text-white" : "text-primary"
                          }`}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

            </SafeAreaView>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default MonthPicker;
