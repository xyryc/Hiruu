import ScreenHeader from "@/components/header/ScreenHeader";
import LeaveRequestCard from "@/components/ui/cards/LeaveRequestCard";
import LeaveRequestApprovalModal from "@/components/ui/modals/LeaveRequestApprovalModal";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

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
        {/* pending screen */}
        {selectedTab === "Approved" && (
          <View>
            {approvedRequests.map((item: any, i: number) => (
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
            {!businessShiftRequestsLoading && approvedRequests.length === 0 ? (
              <Text className="text-center text-sm text-secondary mt-6">
                No approved requests found.
              </Text>
            ) : null}
          </View>
        )}

        {/* New Request Tab */}
        {selectedTab === "New Request" && (
          <View>
            {pendingRequests.map((item: any, i: number) => (
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
            {!businessShiftRequestsLoading && pendingRequests.length === 0 ? (
              <Text className="text-center text-sm text-secondary mt-6">
                No pending requests found.
              </Text>
            ) : null}
          </View>
        )}

        {businessShiftRequestsLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : null}

        <LeaveRequestApprovalModal
          visible={isSuccess}
          onClose={() => setIssuccess(false)}
          reject={reject}
          request={selectedRequest}
          loading={approveShiftRequestLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaveRequest;
