import ScreenHeader from "@/components/header/ScreenHeader";
import AssignRoleModal from "@/components/ui/modals/AssignRoleModal";
import WorkingHourSettingsModal from "@/components/ui/modals/WorkingHourSettingsModal";
import { useBusinessStore } from "@/stores/businessStore";
import { AntDesign, Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type TeamMember = {
  id: string;
  userId: string;
  name: string;
  role: string;
  profilePic: string | null;
  workHourPeriod: string | null;
  workHourAmount: number | null;
  location: string;
};

const assignRole = [
  { id: "1", name: "Employee" },
  { id: "2", name: "Manager" },
  { id: "3", name: "HR / Recruiter" },
  { id: "4", name: "Shift Supervisor" },
  { id: "5", name: "Auditor" },
];

const formatWorkHourPeriod = (period?: string | null) => {
  if (!period) return "Not set";
  return period.charAt(0).toUpperCase() + period.slice(1);
};

const formatWorkHourAmount = (amount?: number | null) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "Not set";
  return `${amount} hrs`;
};

const ManageTeamPanel = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignRole, setSelectedAssignRole] = useState<string>();
  const [showWorkingHourSettingsModal, setShowWorkingHourSettingsModal] =
    useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { selectedBusinesses, getBusinessEmployees } = useBusinessStore();
  const params = useLocalSearchParams<{ businessId?: string }>();
  const resolvedBusinessId = params.businessId || selectedBusinesses[0];

  useEffect(() => {
    if (!resolvedBusinessId) {
      setTeamMembers([]);
      return;
    }

    let isMounted = true;
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const source = await getBusinessEmployees(resolvedBusinessId);
        const mapped = (Array.isArray(source) ? source : [])
          .map((item: any) => {
            const user = item?.user;
            if (!item?.id || !user?.id) return null;

            const address = user?.address;
            const location =
              typeof address === "string"
                ? address
                : address?.address ||
                [address?.city, address?.country].filter(Boolean).join(", ");

            return {
              id: String(item.id),
              userId: String(user.id),
              name: user?.name || "N/A",
              role: item?.role?.role?.name || item?.role?.name || "Not assigned",
              profilePic: user?.avatar || null,
              workHourPeriod:
                typeof item?.workHourPeriod === "string"
                  ? item.workHourPeriod
                  : null,
              workHourAmount:
                typeof item?.workHourAmount === "number" &&
                Number.isFinite(item.workHourAmount)
                  ? item.workHourAmount
                  : null,
              location: location || "Location unavailable",
            } as TeamMember;
          })
          .filter(Boolean) as TeamMember[];

        if (isMounted) {
          setTeamMembers(mapped);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load team members");
        if (isMounted) {
          setTeamMembers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();
    return () => {
      isMounted = false;
    };
  }, [resolvedBusinessId, getBusinessEmployees]);

  const filterOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of teamMembers) {
      const key = member.role.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const roleFilters = Array.from(counts.entries()).map(([value, count]) => ({
      label: value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value,
      count,
    }));

    return [{ label: "All", value: "all", count: teamMembers.length }, ...roleFilters];
  }, [teamMembers]);

  const filteredTeamMembers = useMemo(
    () =>
      teamMembers.filter((member) => {
        const memberRole = member.role.toLowerCase();
        const matchesFilter = filter === "all" || memberRole === filter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          member.name.toLowerCase().includes(q) ||
          memberRole.includes(q) ||
          member.location.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
      }),
    [filter, searchQuery, teamMembers]
  );

  const renderTeamMember = ({ item }: { item: TeamMember }) => (
    <View className="mx-5 border border-[#EEEEEE] mb-3 rounded-3xl p-4">
      <View className="flex-row items-start justify-between ">
        <View className="flex-row items-center gap-3 flex-1">
          <Image
            source={item.profilePic || require("@/assets/images/placeholder.png")}
            contentFit="cover"
            style={{ width: 42, height: 42, borderRadius: 24 }}
          />
          <View className="flex-1">
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              {item.name}
            </Text>
            <Text className="text-sm text-secondary dark:text-dark-secondary">
              {item.role}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className=" w-10 h-10 rounded-full flex-row justify-center items-center bg-[#E5F4FD]">
            <Image
              source={require("@/assets/images/messages-fill.svg")}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <View className="flex-row justify-between mt-4">
          <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
            Work Hour Period:
          </Text>
          <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-regular">
            {formatWorkHourPeriod(item.workHourPeriod)}
          </Text>
        </View>

        <View className="flex-row justify-between mt-2.5">
          <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
            Work Hour Amount:
          </Text>
          <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-regular">
            {formatWorkHourAmount(item.workHourAmount)}
          </Text>
        </View>

        <View className="flex-row justify-between mt-2.5">
          <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
            Location:
          </Text>
          <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-regular">
            {item.location}
          </Text>
        </View>
      </View>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        contentFit="contain"
        style={{ width: 360, height: 2, marginTop: 15 }}
      />

      <View className=" mt-2.5 flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={() =>
            router.push({
              pathname: "/screens/jobs/business/user-profile-preview",
              params: {
                userId: item.userId,
                ...(resolvedBusinessId ? { businessId: resolvedBusinessId } : {}),
                canRate: "true",
              },
            })
          }
        >
          <Text className="text-[#4FB2F3] text-sm font-proximanova-semibold">
            View Profile
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#4FB2F3" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => setShowWorkingHourSettingsModal(true)}
            className="p-1"
          >
            <AntDesign name="field-time" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-[#11293A] px-5 py-2 rounded-full"
          >
            <Text className="text-[#ffffff] text-sm font-proximanova-semibold">
              Manage Role
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title={`Team Panel(${teamMembers.length})`}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <View>
        <View className="flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2 mx-5 my-5">
          <EvilIcons name="search" size={24} color="#666" />
          <TextInput
            placeholder="Search here..."
            className="ml-2 py-1.5 text-gray-700 dark:text-dark-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setFilter(option.value)}
              className={`px-4 py-1 rounded-full mb-4 mr-2 border ${filter === option.value
                ? "bg-[#11293A] border-[#11293A]"
                : "bg-white dark:bg-dark-background border-[#EEEEEE]"
                }`}
              style={{
                flexShrink: 0,
                maxWidth: 180,
                minHeight: 30,
                justifyContent: "center",
              }}
            >
              <Text
                className={`font-proximanova-regular text-sm ${filter === option.value
                  ? "text-white font-proximanova-semibold"
                  : "text-primary dark:text-dark-primary"
                  }`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {option.label} ({option.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4FB2F3" />
          </View>
        ) : (
          <FlatList
            data={filteredTeamMembers}
            renderItem={renderTeamMember}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center mt-20">
                <Text className="text-secondary dark:text-dark-secondary">
                  No team members found.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <WorkingHourSettingsModal
        visible={showWorkingHourSettingsModal}
        onClose={() => setShowWorkingHourSettingsModal(false)}
      />

      <AssignRoleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        assignRole={assignRole}
        selectedAssignRole={selectedAssignRole}
        setSelectedAssignRole={setSelectedAssignRole}
      />
    </SafeAreaView>
  );
};

export default ManageTeamPanel;
