import ScreenHeader from "@/components/header/ScreenHeader";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ActionCard from "@/components/ui/cards/ActionCard";
import ShiftLogCard from "@/components/ui/cards/ShiftLogCard";
import TaskCard from "@/components/ui/cards/TaskCard";
import WorkHoursChart from "@/components/ui/cards/WorkHourChart";
import TrackHoursFilter from "@/components/ui/modals/TrackHoursFilter";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TrackHours = () => {
  const handleLogin = () => {
    router.push("./correction-request");
  };
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
        title="Track Hours"
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            This Month’s Overview
          </Text>

          <View className="mt-2 bg-[#E5F4FD] dark:bg-dark-background rounded-2xl  border-hairline border-[#4FB2F3]">
            {/* top */}
            <View className="flex-row justify-between border-b-hairline border-[#4FB2F3]">
              <View className="pl-2.5 pt-3.5 border-r-hairline pb-3 border-[#4FB2F3] w-1/3">
                {/* Icon Circle */}
                <View className="p-1.5 bg-white mr-auto rounded-full border-hairline border-[#4FB2F3]">
                  <MaterialCommunityIcons
                    name="clock"
                    size={16}
                    color="#4FB2F3"
                  />
                </View>

                {/* Text Labels */}
                <Text className="mt-1.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  Total Hours
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  32h 45m
                </Text>
              </View>

              <View className="pl-2.5 pt-3.5 border-r-hairline pb-3 border-[#4FB2F3] w-1/3">
                {/* Icon Circle */}
                <View className="p-1.5 bg-white mr-auto rounded-full border-hairline border-[#4FB2F3]">
                  <Ionicons name="checkmark-circle" size={16} color="#4FB2F3" />
                </View>

                {/* Text Labels */}
                <Text className="mt-1.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  Total Hours
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  32h 45m
                </Text>
              </View>

              <View className="pl-2.5 pt-3.5 pb-3 w-1/3">
                {/* Icon Circle */}
                <View className="p-1.5 bg-white mr-auto rounded-full border-hairline border-[#4FB2F3]">
                  <Entypo name="circle-with-plus" size={16} color="#4FB2F3" />
                </View>

                {/* Text Labels */}
                <Text className="mt-1.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  Total Hours
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  32h 45m
                </Text>
              </View>
            </View>

            {/* bottom */}
            <View className="flex-row gap-2 items-center mx-4 my-6">
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                Status:
              </Text>
              <StatusBadge status="accepted" label="On Track " />
              <StatusBadge status="upcoming" label="Below Target" />
            </View>
          </View>
        </View>

        <View className="mt-8 mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Daily shift Log
          </Text>
          <ShiftLogCard />

          <PrimaryButton
            onPress={() =>
              router.push("/screens/home/shift/track-hours/attendance-log")
            }
            title="View Attendance log"
            className="mt-4"
          />

          {/* missing log activity */}
          <View className="flex-row justify-between mt-8">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Missing log Activities
            </Text>
            <Link
              href="./missing-log"
              className="font-proximanova-semibold text-sm text-[#4FB2F3]"
            >
              See All
            </Link>
          </View>

          <ScrollView
            className="mt-4"
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <TaskCard
              shiftTitle="Hotel & Bar Management"
              startTime="10:00 AM"
              endTime="6:00 PM"
              shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
              teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
              totalMembers={30}
              address="230 Aaron Bushnell St"
              city="Palestine, PL"
              onLoginPress={handleLogin}
              status="completed"
              requestLog={true}
            />

            <TaskCard
              shiftTitle="Hotel & Bar Management"
              startTime="10:00 AM"
              endTime="6:00 PM"
              shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
              teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
              totalMembers={30}
              address="230 Aaron Bushnell St"
              city="Palestine, PL"
              onLoginPress={handleLogin}
              status="completed"
              requestLog={true}
            />

            <TaskCard
              shiftTitle="Hotel & Bar Management"
              startTime="10:00 AM"
              endTime="6:00 PM"
              shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
              teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
              totalMembers={30}
              address="230 Aaron Bushnell St"
              city="Palestine, PL"
              onLoginPress={handleLogin}
              status="completed"
              requestLog={true}
            />
          </ScrollView>

          {/* work pattern */}
          <View className="mt-7">
            <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary mb-6">
              Your Work Pattern
            </Text>

            <WorkHoursChart />
          </View>

          {/* token */}
          <View className="mt-8">
            <ActionCard
              title="Shows  Earned  Tokens  This  Week !"
              buttonTitle="View"
              rightImage={require("@/assets/images/engagement.svg")}
              imageClass="right-4.5 -bottom-5"
              imageWidth={131}
              imageHeight={117}
              background={require("@/assets/images/engagement-bg.svg")}
              backgroundClass="right-9"
              backgroundWidth={103}
              backgroundHeight={80}
            />
          </View>
        </View>

        <TrackHoursFilter visible={isModal} onClose={() => setIsModal(false)} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackHours;
