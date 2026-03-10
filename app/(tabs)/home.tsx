import HomeHeader from "@/components/header/HomeHeader";
import WelcomeHeader from "@/components/header/WelcomeHeader";
import BusinessProfile from "@/components/layout/BusinessProfile";
import EngagementPerks from "@/components/layout/EngagementPerks";
import FindNewJob from "@/components/layout/FindNewJob";
import JoinColleague from "@/components/layout/JoinColleague";
import ProfileProgress from "@/components/layout/ProfileProgress";
import TodaysShift from '@/components/layout/TodaysShift';
import Widgets from "@/components/layout/Widgets";
import { profileService } from "@/services/profileService";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserHome = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    const result = await profileService.getProfile();
    setProfileData(result.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const hydrateProfile = async () => {
        try {
          const result = await profileService.getProfile();
          if (!isMounted) return;
          setProfileData(result.data);
        } catch {
          // Silent fail to keep home fast/stable.
        }
      };

      hydrateProfile();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadProfile();
    } catch {
      // Silent fail to keep home stable on refresh too.
    } finally {
      setIsRefreshing(false);
    }
  }, [loadProfile]);


  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#BDE4F9" />

      {/* these sections will render dynamically based on permissions set by business */}
      <HomeHeader className="mt-2.5 mb-5" />

      <WelcomeHeader
        className="pb-5"
        name={profileData?.name || profileData?.email}
        avatar={profileData?.avatar}
        coins={profileData?.wallet?.coins}
      />

      {/* main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* profile progress */}
        {!(profileData?.onboarding >= 5) && (
          <ProfileProgress onboarding={profileData?.onboarding} className='mb-7' />
        )}

        {/* join your collegues */}
        <JoinColleague />

        {/* find new job */}
        <FindNewJob className="mt-7" />

        {/* create business */}
        {(profileData?.ownedBusinesses?.length ?? 0) === 0 && (
          <BusinessProfile className="mt-7" />
        )}

        {/* your todays shift */}
        <TodaysShift className="mt-7" />

        {/* quick actions */}
        {/* <QuickAction className="mt-7" /> */}

        {/* work insights */}
        {/* <WorkInsights className="mt-7" /> */}

        {/* engagement & perks */}
        <EngagementPerks className="mt-7" />

        {/* widgets */}
        <Widgets className="mt-7" />

        {/* ============== merged ============= */}
        {/* profile progress */}
        {/* <ProfileProgress /> */}

        {/* Business Summary */}
        {/* <BusinessSummary className="mt-8" /> */}

        {/* Today’s Shifts Summary */}
        {/* <TodayShiftsSummary /> */}

        {/* Today’s Attendance Summary */}
        {/* <AttendanceSummary className="mx-5 mt-8" /> */}

        {/* See Employee rank on board */}
        {/* <View className="mx-4 mt-7">
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
        </View> */}

        {/* performance trend */}
        {/* <PerformanceTrend className="mt-7" /> */}

        {/* quick actions */}
        {/* <QuickAction className="mt-7" /> */}

        {/* Team Insights */}
        {/* <WorkInsights title="Team Insights" className="mt-7" /> */}

        {/* job Board */}
        {/* <FindNewJob business={true} className="mt-7" /> */}

        {/* Top performers */}
        {/* <TopPerformer className="mt-7" /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserHome;

