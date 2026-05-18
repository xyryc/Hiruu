import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import SwapRequestModal from "@/components/ui/modals/SwapRequestModal";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type SwapCandidateItem = {
  id: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string | null;
  };
  role?: {
    role?: {
      id?: string;
      name?: string;
    };
  };
};

const SwapColleagueRowSkeleton = () => (
  <View className="flex-row items-center pb-3 mb-3 border-b border-[#0B113C1A]">
    <View className="rounded-full mr-4 justify-center items-center">
      <View className="w-10 h-10 rounded-full bg-[#E5E7EB]" />
    </View>

    <View className="flex-1">
      <View className="h-4 w-40 rounded-md bg-[#E5E7EB]" />
      <View className="mt-2 h-3 w-24 rounded-md bg-[#E5E7EB]" />
    </View>

    <View className="w-5 h-5 rounded-full bg-[#E5E7EB]" />
  </View>
);

const SwapShiftsRequest = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    businessId?: string | string[];
    shiftAssignmentId?: string | string[];
  }>();
  const businessIdFromParams = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;
  const shiftAssignmentIdFromParams = Array.isArray(params.shiftAssignmentId)
    ? params.shiftAssignmentId[0]
    : params.shiftAssignmentId;
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const resolvedBusinessId = businessIdFromParams || selectedBusinesses?.[0] || "";

  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [candidates, setCandidates] = useState<SwapCandidateItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadColleagues = async () => {
      if (!resolvedBusinessId || !shiftAssignmentIdFromParams) {
        if (active) setCandidates([]);
        return;
      }

      try {
        if (active) setIsLoading(true);
        const response = await axiosInstance.get(
          `/shift-assignment/${resolvedBusinessId}/${shiftAssignmentIdFromParams}/swap-candidates`
        );
        const result = response?.data;

        if (!result?.success) {
          throw new Error(result?.message || "Failed to fetch swap candidates");
        }

        if (active) {
          setCandidates(Array.isArray(result?.data) ? result.data : []);
        }
      } catch (error: any) {
        if (active) {
          toast.error(
            translateApiMessage(error?.message || "failed_to_load_colleagues")
          );
          setCandidates([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadColleagues();

    return () => {
      active = false;
    };
  }, [resolvedBusinessId, shiftAssignmentIdFromParams]);

  const filteredColleagues = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;

    return candidates.filter((item) => {
      const name = item?.user?.name || "";
      const email = item?.user?.email || "";
      const role = item?.role?.role?.name || "";
      return `${name} ${email} ${role}`.toLowerCase().includes(q);
    });
  }, [candidates, search]);
  const skeletonRows = useMemo(
    () => Array.from({ length: 8 }, (_, index) => `swap-colleague-skeleton-${index}`),
    []
  );

  const isSelected = (candidateId: string) => selectedUsers.includes(candidateId);

  const toggleUser = (candidateId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSendRequest = async () => {
    if (!resolvedBusinessId || !shiftAssignmentIdFromParams) {
      toast.error("Missing shift context for swap request");
      return;
    }

    if (!selectedUsers.length) {
      toast.error("Please select at least one colleague");
      return;
    }

    try {
      setRequestLoading(true);
      const response = await axiosInstance.post(
        `/shift-assignment/${resolvedBusinessId}/${shiftAssignmentIdFromParams}/request-swap`,
        {
          targetEmploymentIds: selectedUsers,
          reason: "",
        }
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to submit swap request");
      }

      setShowModal(true);
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "failed_to_submit_swap_request")
      );
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-background">
      <StatusBar style="dark" backgroundColor="#E5F4FD" />

      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-4 pb-6 rounded-b-3xl"
        title="Swap Shift"
        titleClass="dark:text-primary"
        iconColor="#111111"
        components={
          <SimpleStatusBadge
            title="All Colleagues"
            className="border-[0.5px] border-[#F3934F4D] !bg-white"
            textColor="#F3934F"
          />
        }
      />

      <View className="p-5 bg-white flex-1">
        <SearchBar value={search} onSearch={setSearch} />

        <View className="mt-4 flex-1">
          <Text className="font-semibold text-primary dark:text-dark-primary mb-4">
            Select ({Math.max(candidates.length - selectedUsers.length, 0)}/{candidates.length})
          </Text>

          {isLoading ? (
            <View className="flex-1" pointerEvents="none">
              {skeletonRows.map((id) => (
                <View key={id}>
                  <SwapColleagueRowSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredColleagues.map((item) => {
                const candidateId = item?.id;
                if (!candidateId) return null;
                const avatar = item?.user?.avatar;
                const name = item?.user?.name || "User";
                const selected = isSelected(candidateId);

                return (
                  <TouchableOpacity
                    key={candidateId}
                    onPress={() => toggleUser(candidateId)}
                    className="flex-row items-center pb-3 mb-3 border-b border-[#0B113C1A]"
                  >
                    <View className="rounded-full mr-4 justify-center items-center">
                      <Image
                        source={avatar || require("@/assets/images/placeholder.png")}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 999,
                        }}
                        contentFit="cover"
                      />
                    </View>

                    <Text className="flex-1 font-proximanova-regular">{name}</Text>

                    <View>
                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4FB2F3"
                        />
                      ) : (
                        <Feather name="circle" size={20} color="#7A7A7A" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {!filteredColleagues.length && (
                <Text className="text-center text-secondary dark:text-dark-secondary mt-6">
                  No colleagues found
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 py-5 items-center justify-end bg-[#E5F4FD] dark:bg-dark-background rounded-t-[20px]">
        <PrimaryButton
          className="mx-5"
          title="Send Request"
          onPress={handleSendRequest}
          loading={requestLoading}
          disabled={requestLoading}
        />
      </View>

      <SwapRequestModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          router.back();
        }}
        selectedCount={selectedUsers.length}
      />
    </SafeAreaView>
  );
};

export default SwapShiftsRequest;
