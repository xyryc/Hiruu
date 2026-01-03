import HomeHeader from "@/components/header/HomeHeader";
import WelcomeHeader from "@/components/header/WelcomeHeader";
import BusinessProfile from "@/components/layout/BusinessProfile";
import EngagementPerks from "@/components/layout/EngagementPerks";
import FindNewJob from "@/components/layout/FindNewJob";
import JoinCollegue from "@/components/layout/JoinCollegue";
import ProfileProgress from "@/components/layout/ProfileProgress";
import QuickAction from "@/components/layout/QuickAction";
import TodaysShift from "@/components/layout/TodaysShift";
import Widgets from "@/components/layout/Widgets";
import WorkInsights from "@/components/layout/WorkInsights";
import React from "react";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserHome = () => {
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
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* profile progress */}
        <ProfileProgress />

        {/* join your collegues */}
        <JoinCollegue className="mt-7" />

        {/* find new job */}
        <FindNewJob className="mt-7" />

        {/* do you  manage a business */}
        <BusinessProfile className="mt-7" />

        {/* your todays shift */}
        <TodaysShift className="mt-7" />

        {/* quick actions */}
        <QuickAction className="mt-7" />

        {/* work insights */}
        <WorkInsights className="mt-7" />

        {/* engagement & perks */}
        <EngagementPerks className="mt-7" />

        {/* widgets */}
        <Widgets className="mt-7" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserHome;
