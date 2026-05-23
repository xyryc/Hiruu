import HomeHeader from "@/components/header/HomeHeader";
import WelcomeHeader from "@/components/header/WelcomeHeader";
import AttendanceSummary from '@/components/layout/AttendanceSummary';
import BusinessProfile from "@/components/layout/BusinessProfile";
import BusinessSummary from '@/components/layout/BusinessSummary';
import BusinessWorkInsights from '@/components/layout/BusinessWorkInsights';
import EngagementPerks from "@/components/layout/EngagementPerks";
import JobBoardCta from "@/components/layout/JobBoardCta";
import JoinColleague from "@/components/layout/JoinColleague";
import PerformanceTrend from '@/components/layout/PerformanceTrend';
import ProfileProgress from "@/components/layout/ProfileProgress";
import QuickActionBusiness from '@/components/layout/QuickActionBusiness';
import QuickActionUser from '@/components/layout/QuickActionUser';
import TodayShiftsSummary from '@/components/layout/TodayShiftsSummary';
import TodaysShift from '@/components/layout/TodaysShift';
import TopPerformer from '@/components/layout/TopPerformer';
import UserWorkInsights from '@/components/layout/UserWorkInsights';
import ActionCard from '@/components/ui/cards/ActionCard';
import { useBusinessPermission } from "@/hooks/useBusinessPermission";
import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import { useFocusEffect } from "expo-router";
import { useRouter } from 'expo-router';
import { t } from "i18next";
import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserHome = () => {
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [businessWidgetsRefreshKey, setBusinessWidgetsRefreshKey] = useState(0);
  const getProfile = useProfileStore((state) => state.getProfile);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const isUserProfile = (selectedBusinesses?.length || 0) === 0;
  const isBusinessProfile = !isUserProfile;
  const isProfileIncomplete = !(profileData?.onboarding >= 5);
  const hasJoinedAtLeastOneBusiness = useMemo(() => {
    const employments = Array.isArray(profileData?.user?.employments)
      ? profileData.user.employments
      : Array.isArray(profileData?.employments)
        ? profileData.employments
        : [];

    return employments.some((employment: any) => {
      const status = String(employment?.status || "").toLowerCase();
      const isActive = status ? status === "active" : true;
      const businessId = employment?.businessId || employment?.business?.id;
      return Boolean(isActive && businessId);
    });
  }, [profileData?.employments, profileData?.user?.employments]);
  const hasNoJoinedBusiness = !hasJoinedAtLeastOneBusiness;

  const profileEmployments = useMemo(() => {
    if (Array.isArray(profileData?.employments)) return profileData.employments;
    if (Array.isArray(profileData?.user?.employments)) return profileData.user.employments;
    return [];
  }, [profileData?.employments, profileData?.user?.employments]);

  const { canRead: canViewBusinessOverview } = useBusinessPermission(
    "business.overview",
    { employments: profileEmployments }
  );
  const { canRead: canViewBusinessStatistics } = useBusinessPermission(
    "business.statistics",
    { employments: profileEmployments }
  );
  const { canRead: canViewBusinessUserStats } = useBusinessPermission(
    "business.user_stats",
    { employments: profileEmployments }
  );

  const loadProfile = useCallback(async () => {
    const result = await getProfile();
    setProfileData(result.data);
  }, [getProfile]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setBusinessWidgetsRefreshKey((prev) => prev + 1);

      const hydrateProfile = async () => {
        try {
          const result = await getProfile();
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
    }, [getProfile])
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
        name={profileData?.name || profileData?.email}
        avatar={profileData?.avatar}
        coins={profileData?.wallet?.coins}
      />

      {/* main content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* shared section */}
        {isProfileIncomplete && (
          <ProfileProgress onboarding={profileData?.onboarding} />
        )}

        {/* business profile sections */}
        {isBusinessProfile && (
          <>
            {/* Business Summary */}
            {canViewBusinessOverview && (
              <>
                <BusinessSummary
                  key={`business-summary-${businessWidgetsRefreshKey}`}
                  className='mt-7'
                />

                {/* todays shift summary */}
                <TodayShiftsSummary />

                {/* Today’s Attendance Summary */}
                <AttendanceSummary className="mx-5 mt-7" />
              </>
            )}

            {/* performance trend */}
            {canViewBusinessStatistics && <PerformanceTrend className="mt-7" />}

            {/* Team Insights */}
            {canViewBusinessUserStats && (
              <BusinessWorkInsights
                key={`business-work-insights-${businessWidgetsRefreshKey}`}
                title={t("common.teamInsights")}
                className="mt-7"
              />
            )}

            {/* quick actions */}
            <QuickActionBusiness className="mt-7" />

            <JobBoardCta
              className='mt-7'
              title={t("user.jobs.jobBoard.title")}
              subtitle={t("user.jobs.jobBoard.subtitle")}
              route="/(tabs)/business-jobs"
            />

            {/* Top performers */}
            <TopPerformer className="mt-7" />
          </>
        )}

        {/* user profile sections */}
        {isUserProfile && (
          <>
            {hasNoJoinedBusiness && (
              <>
                {/* join your collegues */}
                <JoinColleague />

                {/* find new job */}
                <JobBoardCta className="mt-7"
                  title={t("user.jobs.jobBoard.findNewJob")}
                  subtitle={t("user.jobs.jobBoard.exploreAllJobListings")}
                  route="/(tabs)/user-jobs"
                />
              </>
            )}

            {/* create business */}
            {(profileData?.ownedBusinesses?.length ?? 0) === 0 && (
              <BusinessProfile className="mt-7" />
            )}

            {hasJoinedAtLeastOneBusiness && (
              <>
                {/* rank card */}
                <ActionCard
                  className="mx-5 mt-7"
                  title={t("user.profile.leaderboard.seeRank")}
                  buttonTitle={t("common.view")}
                  onPress={() => router.push("/screens/home/leaderboard")}
                  rightImage={require("@/assets/images/rank.svg")}
                  imageClass="absolute bottom-0 right-2.5"
                  imageWidth={144}
                  imageHeight={95}
                  background={require("@/assets/images/chessboard-bg.svg")}
                />

                {/* your todays shift */}
                <TodaysShift className="mt-7" />

                {/* quick actions */}
                <QuickActionUser className='mt-7' />

                {/* work insights */}
                <UserWorkInsights className="mt-7" />

                {/* engagement & perks */}
                <EngagementPerks className="mt-7" />

                {/* widgets */}
                {/* <Widgets className="mt-7" /> */}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView >
  );
};

export default UserHome;
