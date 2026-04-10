import ScreenHeader from "@/components/header/ScreenHeader";
import AssignRoleModal from "@/components/ui/modals/AssignRoleModal";
import WorkingHourSettingsModal from "@/components/ui/modals/WorkingHourSettingsModal";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { chatService } from "@/services/chatService";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AntDesign, Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const [selectedWorkingHourEmploymentId, setSelectedWorkingHourEmploymentId] =
    useState<string | null>(null);
  const [selectedWorkingHourPeriod, setSelectedWorkingHourPeriod] = useState<
    string | null
  >(null);
  const [selectedWorkingHourAmount, setSelectedWorkingHourAmount] = useState<
    number | null
  >(null);
  const [updatingWorkHours, setUpdatingWorkHours] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedEmploymentId, setSelectedEmploymentId] = useState<string | null>(
    null
  );
  const [assigningRole, setAssigningRole] = useState(false);
  const [creatingChatForUserId, setCreatingChatForUserId] = useState<string | null>(
    null
  );
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const {
    selectedBusinesses,
    getBusinessEmployees,
    getMyBusinessRoles,
    assignBusinessRoleToEmployment,
  } = useBusinessStore();
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
        toast.error(
          translateApiMessage(error?.message || "Failed to load team members")
        );
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

  const openRoleModal = async (employmentId: string) => {
    setSelectedEmploymentId(employmentId);
    setShowModal(true);
    setSelectedAssignRole(undefined);

    if (!resolvedBusinessId) return;

    try {
      setRolesLoading(true);
      const roleList = await getMyBusinessRoles(resolvedBusinessId);
      const mappedRoles = (Array.isArray(roleList) ? roleList : [])
        .filter(
          (role: any) =>
            role?.id &&
            role?.role?.name &&
            !role?.isDeleted &&
            !role?.isSystemLocked &&
            role?.role?.name?.toLowerCase?.() !== "owner"
        )
        .map((role: any) => ({
          id: role.id,
          name: role.role.name,
        }));
      setRoles(mappedRoles);
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || "Failed to load role list"));
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleApplyRole = async () => {
    if (!resolvedBusinessId || !selectedEmploymentId || !selectedAssignRole) {
      toast.error(translateApiMessage("Please select a role."));
      return;
    }

    const selectedRole = roles.find((role) => role.id === selectedAssignRole);
    const nextRoleName = selectedRole?.name || "Not assigned";
    const previousTeam = teamMembers;

    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === selectedEmploymentId ? { ...member, role: nextRoleName } : member
      )
    );

    try {
      setAssigningRole(true);
      const result = await assignBusinessRoleToEmployment(
        resolvedBusinessId,
        selectedEmploymentId,
        selectedAssignRole
      );
      toast.success(translateApiMessage(result?.message || "business_role_assigned"));
      setShowModal(false);
    } catch (error: any) {
      setTeamMembers(previousTeam);
      toast.error(translateApiMessage(error?.message || "Failed to assign role"));
    } finally {
      setAssigningRole(false);
    }
  };

  const openWorkingHourModal = (item: TeamMember) => {
    setSelectedWorkingHourEmploymentId(item.id);
    setSelectedWorkingHourPeriod(item.workHourPeriod);
    setSelectedWorkingHourAmount(item.workHourAmount);
    setShowWorkingHourSettingsModal(true);
  };

  const handleApplyWorkingHours = async (payload: {
    workHourPeriod: string | null;
    workHourAmount: number | null;
  }) => {
    if (!selectedWorkingHourEmploymentId) {
      toast.error(translateApiMessage("Employee information is unavailable"));
      return;
    }
    if (!payload.workHourPeriod || payload.workHourAmount == null) {
      toast.error(translateApiMessage("Please provide work hour period and amount."));
      return;
    }

    const previousTeam = teamMembers;
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === selectedWorkingHourEmploymentId
          ? {
            ...member,
            workHourPeriod: payload.workHourPeriod,
            workHourAmount: payload.workHourAmount,
          }
          : member
      )
    );

    try {
      setUpdatingWorkHours(true);
      const response = await axiosInstance.put(
        `/employment/employees/${selectedWorkingHourEmploymentId}`,
        payload
      );
      const result = response?.data;

      const updatedEmployment = result?.data;
      if (updatedEmployment?.id) {
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === String(updatedEmployment.id)
              ? {
                ...member,
                workHourPeriod:
                  typeof updatedEmployment?.workHourPeriod === "string"
                    ? updatedEmployment.workHourPeriod
                    : member.workHourPeriod,
                workHourAmount:
                  typeof updatedEmployment?.workHourAmount === "number" &&
                    Number.isFinite(updatedEmployment.workHourAmount)
                    ? updatedEmployment.workHourAmount
                    : member.workHourAmount,
              }
              : member
          )
        );
      }

      toast.success(
        translateApiMessage(result?.message || "employment_updated_successfully")
      );
      setShowWorkingHourSettingsModal(false);
    } catch (error: any) {
      setTeamMembers(previousTeam);
      toast.error(
        translateApiMessage(error?.response?.data?.message || error?.message)
      );
    } finally {
      setUpdatingWorkHours(false);
    }
  };

  const handleMessagePress = async (participantId: string) => {
    if (!participantId) {
      toast.error(translateApiMessage("User information is unavailable"));
      return;
    }

    try {
      setCreatingChatForUserId(participantId);
      const result = await chatService.createDirectChat(participantId);
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error("Chat room id is missing");
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || "Failed to start chat"));
    } finally {
      setCreatingChatForUserId(null);
    }
  };

  const openUserProfile = (userId: string) => {
    if (!userId) {
      toast.error(translateApiMessage("Employee information is unavailable"));
      return;
    }

    router.push({
      pathname: "/screens/jobs/business/user-profile-preview",
      params: {
        userId,
        ...(resolvedBusinessId ? { businessId: resolvedBusinessId } : {}),
        canRate: resolvedBusinessId ? "true" : "false",
      },
    });
  };

  const renderTeamMember = ({ item }: { item: TeamMember }) => {
    const isOwnerRole = item.role.trim().toLowerCase() === "owner";

    return (
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
            {!isOwnerRole ? (
              <TouchableOpacity
                onPress={() => handleMessagePress(item.userId)}
                disabled={creatingChatForUserId === item.userId}
                className=" w-10 h-10 rounded-full flex-row justify-center items-center bg-[#E5F4FD]"
              >
                {creatingChatForUserId === item.userId ? (
                  <ActivityIndicator size="small" color="#4FB2F3" />
                ) : (
                  <Image
                    source={require("@/assets/images/messages-fill.svg")}
                    contentFit="contain"
                    style={{ width: 20, height: 20 }}
                  />
                )}
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => openWorkingHourModal(item)}>
              <Entypo name="dots-three-vertical" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View className="flex-row justify-between mt-4">
            <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
              Work Hours (Amount/Period)
            </Text>
            <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-semibold">
              {formatWorkHourAmount(item.workHourAmount)} / {formatWorkHourPeriod(item.workHourPeriod)}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2.5">
            <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
              Location:
            </Text>
            <Text
              className="text-primary dark:text-dark-primary text-sm font-proximanova-regular"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ maxWidth: "60%", textAlign: "right" }}
            >
              {item.location}
            </Text>
          </View>
        </View>

        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ width: "100%", height: 2, marginTop: 15 }}
        />

        <View className=" mt-2.5 flex-row items-center justify-between">
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => openUserProfile(item.userId)}
          >
            <Text className="text-[#4FB2F3] text-sm font-proximanova-semibold">
              View Profile
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#4FB2F3" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => openWorkingHourModal(item)}
              className="p-1"
            >
              <AntDesign name="field-time" size={24} color="black" />
            </TouchableOpacity>

            {!isOwnerRole ? (
              <TouchableOpacity
                onPress={() => openRoleModal(item.id)}
                className="bg-[#11293A] px-5 py-2 rounded-full"
              >
                <Text className="text-[#ffffff] text-sm font-proximanova-semibold">
                  Manage Role
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

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
          title={`Team Panel(${teamMembers.length})`}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
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
              <View className="px-5 pt-10">
                <StatusStateCard
                  image={require("@/assets/images/male.svg")}
                  title="No Team Members"
                  text="There are no team members to show right now."
                />
              </View>
            }
          />
        )}
      </View>

      <WorkingHourSettingsModal
        visible={showWorkingHourSettingsModal}
        onClose={() => setShowWorkingHourSettingsModal(false)}
        initialPeriod={selectedWorkingHourPeriod}
        initialAmount={selectedWorkingHourAmount}
        onApply={handleApplyWorkingHours}
        applying={updatingWorkHours}
      />

      <AssignRoleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        assignRole={roles}
        emptyStateText="No roles found on this business."
        loading={rolesLoading}
        onApply={handleApplyRole}
        applying={assigningRole}
        selectedAssignRole={selectedAssignRole}
        setSelectedAssignRole={setSelectedAssignRole}
      />
    </SafeAreaView>
  );
};

export default ManageTeamPanel;
