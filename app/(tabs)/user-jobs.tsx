import ScreenHeader from "@/components/header/ScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserJobs = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScreenHeader
        className="px-5 pt-2.5"
        title="Find Job"
        components={
          <View className="flex-row items-center gap-2.5">
            {/* left */}
            <TouchableOpacity
              onPress={() => router.push("/screens/jobs/job-request")}
              className="w-10 h-10 justify-center items-center bg-[#f5f5f5] border-[0.5px] border-[#b2b1b169] rounded-full"
            >
              <Ionicons name="newspaper-outline" size={20} color="#4b5563" />
              <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
                <Text className="text-[10px] text-white">1</Text>
              </View>
            </TouchableOpacity>

            {/* right */}
            <TouchableOpacity
              onPress={() => router.push("/screens/jobs/chatlist")}
              className="w-10 h-10 justify-center items-center bg-[#f5f5f5] border-[0.5px] border-[#b2b1b169] rounded-full"
            >
              <Image
                source={require("@/assets/images/messages.svg")}
                style={{
                  width: 20,
                  height: 20,
                }}
                contentFit="contain"
              />
              <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
                <Text className="text-[10px] text-white">1</Text>
              </View>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* search box */}
        <View className="flex-row items-center gap-1.5 mr-12 mt-3.5 px-5">
          <SearchBar />

          <TouchableOpacity
            onPress={() => router.push("/screens/jobs/user/filter")}
          >
            <Ionicons name="filter-circle" size={44} color="black" />
          </TouchableOpacity>
        </View>

        {/* featured job */}
        <View className="mt-7">
          <View className="flex-row justify-between items-center mb-4 px-5">
            <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
              Featured Job
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-5"
          >
            <JobCard className="mr-2.5" />
            <JobCard className="mr-2.5" />
            <JobCard className="mr-2.5" />
            <JobCard className="mr-2.5" />
          </ScrollView>
        </View>

        <View className="mt-7 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
              Suggested Job
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <JobCard className="bg-white border border-[#EEEEEE] mb-4" />
          <JobCard className="bg-white border border-[#EEEEEE] mb-4" />
          <JobCard className="bg-white border border-[#EEEEEE] mb-4" />
          <JobCard className="bg-white border border-[#EEEEEE] mb-4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserJobs;
