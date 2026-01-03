import { EvilIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

const ShiftTemplateCard = ({ className, title, weekly }: any) => {
  const scrollX = new Animated.Value(0);
  const roles = [
    { name: "Cashier", count: 2, bg: "#EEF2FF", color: "#4F46E5" },
    { name: "Bartender", count: 1, bg: "#FEF9C3", color: "#CA8A04" },
    { name: "Cleaner", count: 1, bg: "#DCFCE7", color: "#16A34A" },
    { name: "Security", count: 1, bg: "#FFE4E6", color: "#E11D48" },
    { name: "Waiter", count: 3, bg: "#E0F2FE", color: "#0284C7" },
    { name: "Chef", count: 1, bg: "#F3E8FF", color: "#9333EA" },
  ];

  return (
    <View className={`${className}`}>
      <View className="border border-[#EEEEEE] rounded-[14px]">
        <View className="bg-[#E5F4FD] rounded-t-[14px] flex-row justify-between items-center py-1.5">
          <Text className="mx-3 font-proximanova-semibold text-primary dark:text-dark-primary ">
            {title}
          </Text>
          <View className="flex-row gap-1.5 items-center mx-3">
            {weekly && (
              <TouchableOpacity
                onPress={() => router.push("/screens/schedule/business/assign")}
                className="h-10 w-10 rounded-full bg-[#FFF] flex-row justify-center items-center "
              >
                <MaterialIcons name="person-add-alt" size={20} color="black" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/schedule/business/edit-templete")
              }
              className="h-10 w-10 rounded-full bg-[#FFF] flex-row justify-center items-center "
            >
              <Feather name="edit-2" size={20} color="black" />
            </TouchableOpacity>
            {weekly || <EvilIcons name="trash" size={24} color="#F34F4F" />}
          </View>
        </View>

        {/* time box */}
        <View className="p-4">
          <View className="flex-row justify-between items-center ">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              Time:
            </Text>
            <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
              7:00 AM - 3:00 PM
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-2.5 ">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              Break Time:
            </Text>
            <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
              10:00 AM - 11:00 PM
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-2.5">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              Location:
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="font-proximanova-regular text-sm text-primary dark:text-dark-primary w-1/2"
            >
              136 Avenue-Maciezine, New York, USA, 65004
            </Text>
          </View>

          <View className="flex-row items-start mt-2.5">
            {/* Label */}
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1">
              Roles:
            </Text>

            {/* Scrollable Role Chips with fade edge */}
            <View className="flex-1 ml-2">
              <Animated.FlatList
                data={roles}
                horizontal
                keyExtractor={(item) => item.name}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                renderItem={({ item }) => (
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Text
                      className="font-proximanova-regular text-xs"
                      style={{ color: item.color }}
                    >
                      {item.name}: {item.count}
                    </Text>
                  </View>
                )}
              />

              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 50,
                }}
              />
            </View>
          </View>

          {/* Incomplete: Bartender 1 needed */}
          {weekly && (
            <View className="flex-row items-center gap-2.5 mt-2.5">
              <Feather name="alert-triangle" size={16} color="#F34F4F" />
              <Text
                numberOfLines={1}
                className="ml-1.5 text-sm font-proximanova-regular text-[#F34F4F]"
              >
                Incomplete: Bartender 1 needed
              </Text>
            </View>
          )}

          {/* line  */}
          <Image
            source={require("@/assets/images/dotted-line.svg")}
            contentFit="contain"
            style={{ width: 295, height: 2, marginTop: 15 }}
          />

          <View className="flex-row gap-2 items-center mt-3">
            <Image
              source={require("@/assets/images/reward/nameplate-profile.png")}
              contentFit="contain"
              style={{ width: 30, height: 30 }}
            />
            <Text className="font-proximanova-regular  text-secondary dark:text-dark-secondary">
              Palm Beach
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShiftTemplateCard;
