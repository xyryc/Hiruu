import HomeHeader from "@/components/header/HomeHeader";
import WelcomeHeader from "@/components/header/WelcomeHeader";
import AttendanceSummary from "@/components/layout/AttendanceSummary";
import BusinessProfile from "@/components/layout/BusinessProfile";
import BusinessSummary from "@/components/layout/BusinessSummary";
import FindNewJob from "@/components/layout/FindNewJob";
import JoinCollegue from "@/components/layout/JoinCollegue";
import PerformanceTrend from "@/components/layout/PerformanceTrend";
import ProfileProgress from "@/components/layout/ProfileProgress";
import QuickAction from "@/components/layout/QuickAction";
import TodayShiftsSummary from "@/components/layout/TodayShiftsSummary";
import TopPerformer from "@/components/layout/TopPerformer";
import WorkInsights from "@/components/layout/WorkInsights";
import ActionCard from "@/components/ui/cards/ActionCard";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessHome = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#BDE4F9" />

      <HomeHeader className="mt-2.5 mb-5" />

      <WelcomeHeader className="pb-5" />

      {/* main content */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* profile progress */}
        <ProfileProgress />

        {/* Business Summary */}
        <BusinessSummary className="mt-8" />

        {/* Today’s Shifts Summary */}
        <TodayShiftsSummary />

        {/* Today’s Attendance Summary */}
        <AttendanceSummary className="mx-5 mt-8" />

        {/* join your collegues */}
        <JoinCollegue className="mt-7" />

        {/* do you  manage a business */}
        <BusinessProfile className="mt-7" />

        {/* See Employee rank on board */}
        <View className="mx-4 mt-7">
          <ActionCard
            onPress={() => router.push("/screens/home/leaderboard")}
            title="See Employee rank on board"
            buttonTitle="View"
            rightImage={require("@/assets/images/rank.svg")}
            imageClass="absolute bottom-0 right-2.5"
            imageWidth={144}
            imageHeight={95}
            background={require("@/assets/images/chessboard-bg.svg")}
          />
        </View>

        {/* performance trend */}
        <PerformanceTrend className="mt-7" />

        {/* quick actions */}
        <QuickAction className="mt-7" />

        {/* Team Insights */}
        <WorkInsights title="Team Insights" className="mt-7" />

        {/* job Board */}
        <FindNewJob business={true} className="mt-7" />

        {/* Top performers */}
        <TopPerformer className="mt-7" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessHome;
