import ScreenHeader from "@/components/header/ScreenHeader";
import LeaveRequestCard from "@/components/ui/cards/LeaveRequestCard";
import LeaveRequestApprovalModal from "@/components/ui/modals/LeaveRequestApprovalModal";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const styles = StyleSheet.create({
  compactEmptyState: {
    paddingVertical: 28,
  },
  compactEmptyStateTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  compactEmptyStateText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

const LeaveRequestCardSkeleton = ({ showActions }: { showActions?: boolean }) => {
  return (
    <View className="border border-[#EEEEEE] dark:border-[#222] rounded-3xl p-4 mb-3 bg-white dark:bg-dark-background">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-11 h-11 rounded-full bg-[#E5E7EB]" />
          <View className="flex-1">
            <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />
            <View className="mt-2 h-3 w-28 bg-[#E5E7EB] rounded-md" />
          </View>
        </View>
        <View className="h-7 w-20 bg-[#E5E7EB] rounded-full" />
      </View>

      <View className="mt-4">
        <View className="flex-row justify-between">
          <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="mt-2 h-3 w-44 bg-[#E5E7EB] rounded-md" />
      </View>

      {showActions ? (
        <View className="mt-4 flex-row gap-3">
          <View className="h-10 flex-1 bg-[#E5E7EB] rounded-full" />
          <View className="h-10 flex-1 bg-[#E5E7EB] rounded-full" />
        </View>
      ) : null}
    </View>
  );
};

const LeaveRequest = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTab, setSelectedTab] = useState("New Request");
  const [isSuccess, setIssuccess] = useState(false);
  const [reject, setReject] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const insets = useSafeAreaInsets();
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const userBusiness = useBusinessStore((state) => state.userBusiness);
  const businessId = selectedBusinesses?.[0] || userBusiness?.id;
  const {
    businessShiftRequests,
    businessShiftRequestsLoading,
    getBusinessShiftRequests,
    approveBusinessShiftRequest,
    rejectBusinessShiftRequest,
    approveShiftRequestLoading,
  } = useShiftStore();

  const skeletonRequests = useMemo(
    () => Array.from({ length: 5 }, (_, index) => ({ id: `skeleton-${index}` })),
    []
  );

  const loadRequests = useCallback(async () => {
    if (!businessId) return;
    try {
      await getBusinessShiftRequests(businessId);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load leave requests");
    }
  }, [businessId, getBusinessShiftRequests]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const pendingRequests = useMemo(
    () =>
      (Array.isArray(businessShiftRequests) ? businessShiftRequests : []).filter(
        (item: any) => String(item?.status || "").toLowerCase() === "pending"
      ),
    [businessShiftRequests]
  );

  const approvedRequests = useMemo(
    () =>
      (Array.isArray(businessShiftRequests) ? businessShiftRequests : []).filter(
        (item: any) => String(item?.status || "").toLowerCase() === "approved"
      ),
    [businessShiftRequests]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="#E5F4FD"
        translucent={false}
      />

      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
          onPressBack={() => router.back()}
          title="Leave Requests"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        {/* Tabs */}
        <View className="flex-row justify-center mx-5">
          {["New Request", "Approved"].map((tab) => {
            const tabCount =
              tab === "New Request" ? pendingRequests.length : approvedRequests.length;
            return (
              <TouchableOpacity
                className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${selectedTab === tab ? "border-[#11293A] border-b-2" : ""}`}
                key={tab}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  className={`text-center ${selectedTab === tab ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"}`}
                >
                  {tab}
                </Text>
                {tabCount > 0 && (
                  <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
                    <Text className="font-proximanova-semibold text-sm text-white">
                      {tabCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
        {/* Approved Tab */}
        {selectedTab === "Approved" && (
          <View>
            <View className="pt-4 pb-2">
              {businessShiftRequestsLoading
                ? skeletonRequests.map((item) => (
                    <View key={item.id} pointerEvents="none">
                      <LeaveRequestCardSkeleton />
                    </View>
                  ))
                : approvedRequests.map((item: any, i: number) => (
                    <LeaveRequestCard
                      key={item?.id || i}
                      approved
                      request={item}
                      onPressCard={() => {
                        setReject(false);
                        setSelectedRequest(item);
                        setIssuccess(true);
                      }}
                    />
                  ))}
            </View>

            {!businessShiftRequestsLoading && approvedRequests.length === 0 ? (
              <View className="pt-6">
                <StatusStateCard
                  style={styles.compactEmptyState}
                  image={require("@/assets/images/leave-pending.svg")}
                  title="No Approved Requests"
                  text="There are no approved leave requests to show right now."
                  titleStyle={styles.compactEmptyStateTitle}
                  textStyle={styles.compactEmptyStateText}
                />
              </View>
            ) : null}
          </View>
        )}

        {/* New Request Tab */}
        {selectedTab === "New Request" && (
          <View>
            <View className="pt-4 pb-2">
              {businessShiftRequestsLoading
                ? skeletonRequests.map((item) => (
                    <View key={item.id} pointerEvents="none">
                      <LeaveRequestCardSkeleton showActions />
                    </View>
                  ))
                : pendingRequests.map((item: any, i: number) => (
                    <LeaveRequestCard
                      key={item?.id || i}
                      request={item}
                      showReviewActions
                      userId={item?.employment?.user?.id}
                      onAccept={() => {
                        if (!businessId || !item?.id) {
                          toast.error("Unable to approve this request");
                          return;
                        }

                        approveBusinessShiftRequest(businessId, item.id)
                          .then(() => {
                            toast.success(t("api.shift_request_approved"));
                            loadRequests();
                          })
                          .catch((error: any) => {
                            toast.error(
                              error?.message || "Failed to approve leave request"
                            );
                          });
                      }}
                      onReject={() => {
                        if (!businessId || !item?.id) {
                          toast.error("Unable to reject this request");
                          return;
                        }

                        rejectBusinessShiftRequest(businessId, item.id)
                          .then(() => {
                            toast.success(t("api.shift_request_declined"));
                            loadRequests();
                          })
                          .catch((error: any) => {
                            toast.error(
                              error?.message || "Failed to reject leave request"
                            );
                          });
                      }}
                    />
                  ))}
            </View>

            {!businessShiftRequestsLoading && pendingRequests.length === 0 ? (
              <View className="pt-6">
                <StatusStateCard
                  style={styles.compactEmptyState}
                  image={require("@/assets/images/leave-pending.svg")}
                  title="No Pending Requests"
                  text="There are no pending leave requests to show right now."
                  titleStyle={styles.compactEmptyStateTitle}
                  textStyle={styles.compactEmptyStateText}
                />
              </View>
            ) : null}
          </View>
        )}

      </ScrollView>

      <LeaveRequestApprovalModal
        visible={isSuccess}
        onClose={() => setIssuccess(false)}
        reject={reject}
        request={selectedRequest}
        loading={approveShiftRequestLoading}
      />
    </SafeAreaView>
  );
};

export default LeaveRequest;
