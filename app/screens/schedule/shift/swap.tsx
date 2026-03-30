import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import SwapRequestModal from "@/components/ui/modals/SwapRequestModal";
import { useBusinessStore } from "@/stores/businessStore";
import { BusinessColleagueItem, useShiftStore } from "@/stores/shiftStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SwapShiftsRequest = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ businessId?: string | string[] }>();
  const businessIdFromParams = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const resolvedBusinessId = businessIdFromParams || selectedBusinesses?.[0] || "";

  const getBusinessColleagues = useShiftStore((state) => state.getBusinessColleagues);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [colleagues, setColleagues] = useState<BusinessColleagueItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadColleagues = async () => {
      if (!resolvedBusinessId) {
        if (active) setColleagues([]);
        return;
      }

      try {
        if (active) setIsLoading(true);
        const response = await getBusinessColleagues(resolvedBusinessId);
        if (active) {
          setColleagues(Array.isArray(response) ? response : []);
        }
      } catch (error: any) {
        if (active) {
          toast.error(error?.message || "Failed to load colleagues");
          setColleagues([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadColleagues();

    return () => {
      active = false;
    };
  }, [getBusinessColleagues, resolvedBusinessId]);

  const filteredColleagues = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colleagues;

    return colleagues.filter((item) => {
      const name = item?.user?.name || "";
      const role = item?.role?.name || "";
      return `${name} ${role}`.toLowerCase().includes(q);
    });
  }, [colleagues, search]);

  const isSelected = (employmentId: string) => selectedUsers.includes(employmentId);

  const toggleUser = (employmentId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(employmentId)
        ? prev.filter((id) => id !== employmentId)
        : [...prev, employmentId]
    );
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
            Select ({Math.max(colleagues.length - selectedUsers.length, 0)}/{colleagues.length})
          </Text>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#4FB2F3" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredColleagues.map((item) => {
                const employmentId = item?.employmentId;
                const avatar = item?.user?.avatar;
                const name = item?.user?.name || "User";
                const selected = isSelected(employmentId);

                return (
                  <TouchableOpacity
                    key={employmentId}
                    onPress={() => toggleUser(employmentId)}
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
          onPress={() => setShowModal(true)}
        />
      </View>

      <SwapRequestModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
};

export default SwapShiftsRequest;
