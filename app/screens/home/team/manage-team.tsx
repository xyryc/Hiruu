import ScreenHeader from "@/components/header/ScreenHeader";
import AssignRoleModal from "@/components/ui/modals/AssignRoleModal";
import DatePicker from "@/components/ui/inputs/DatePicker";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import WorkingHourSettingsModal from "@/components/ui/modals/WorkingHourSettingsModal";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { chatService } from "@/services/chatService";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AntDesign, Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  status: string;
  roleId: string | null;
  role: string;
  profilePic: string | null;
  workHourPeriod: string | null;
  workHourAmount: number | null;
  location: string;
};

const formatWorkHourPeriod = (period: string | null | undefined, notSetLabel: string) => {
  if (!period) return notSetLabel;
  return period.charAt(0).toUpperCase() + period.slice(1);
};

const formatWorkHourAmount = (
  amount: number | null | undefined,
  notSetLabel: string,
  hoursLabel: string
) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return notSetLabel;
  return `${amount} ${hoursLabel}`;
};

const ManageTeamPanel = () => {
  const { t } = useTranslation();
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
  const [showFireModal, setShowFireModal] = useState(false);
  const [selectedFireEmploymentId, setSelectedFireEmploymentId] = useState<string | null>(
    null
  );
  const [fireReason, setFireReason] = useState("");
  const [fireNotes, setFireNotes] = useState("");
  const [fireEffectiveDate, setFireEffectiveDate] = useState<Date>(new Date());
  const [fireModalKeyboardInset, setFireModalKeyboardInset] = useState(0);
  const [firingEmployee, setFiringEmployee] = useState(false);
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
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setFireModalKeyboardInset(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setFireModalKeyboardInset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        console.log(
          "[ManageTeam] GET /employment/businesses/{businessId}/employees response",
          JSON.stringify(source, null, 2)
        );
        const mapped = (Array.isArray(source) ? source : [])
          .map((item: any) => {
            const user = item?.user;
            if (!item?.id || !user?.id) return null;

            const address = user?.address;
            const location =
              typeof address === "string"
                ? address
                : address?.city;

            return {
              id: String(item.id),
              userId: String(user.id),
              name: user?.name || t("common.na"),
              status: String(item?.status || "").toLowerCase(),
              roleId:
                (typeof item?.role?.id === "string" && item.role.id) ||
                (typeof item?.roleId === "string" && item.roleId) ||
                null,
              role:
                item?.role?.role?.name ||
                item?.role?.name ||
                t("user.profile.roleNotAssignedYet"),
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
              location: location || t("common.cityUnavailable"),
            } as TeamMember;
          })
          .filter(Boolean) as TeamMember[];

        if (isMounted) {
          setTeamMembers(mapped);
        }
      } catch (error: any) {
        toast.error(
          translateApiMessage(
            error?.message || t("user.profile.manageTeam.failedToLoadTeamMembers")
          )
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
  }, [getBusinessEmployees, resolvedBusinessId, t]);

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

    return [
      { label: t("common.all"), value: "all", count: teamMembers.length },
      ...roleFilters,
    ];
  }, [t, teamMembers]);

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

  const skeletonTeamMembers = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => ({
        id: `manage-team-skeleton-${index}`,
        userId: "",
        name: "",
        status: "",
        roleId: null,
        role: "",
        profilePic: null,
        workHourPeriod: null,
        workHourAmount: null,
        location: "",
      })),
    []
  );

  const TeamMemberCardSkeleton = () => {
    return (
      <View className="mx-5 border border-[#EEEEEE] mb-3 rounded-3xl p-4 bg-white dark:bg-dark-background">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-[42px] h-[42px] rounded-full bg-[#E5E7EB]" />
            <View className="flex-1">
              <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />
              <View className="mt-2 h-3 w-28 bg-[#E5E7EB] rounded-md" />
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 rounded-full bg-[#E5E7EB]" />
            <View className="w-4 h-4 rounded-full bg-[#E5E7EB]" />
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row justify-between">
            <View className="h-3 w-40 bg-[#E5E7EB] rounded-md" />
            <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
          </View>
          <View className="flex-row justify-between mt-2.5">
            <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
            <View className="h-3 w-32 bg-[#E5E7EB] rounded-md" />
          </View>
        </View>

        <View className="mt-4 h-[2px] w-full bg-[#E5E7EB] rounded-full" />

        <View className="mt-4 flex-row items-center justify-between">
          <View className="h-4 w-24 bg-[#E5E7EB] rounded-md" />
          <View className="flex-row items-center gap-4">
            <View className="w-7 h-7 rounded-full bg-[#E5E7EB]" />
            <View className="h-9 w-28 rounded-full bg-[#E5E7EB]" />
          </View>
        </View>
      </View>
    );
  };

  const loadRoles = useCallback(async () => {
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
      toast.error(
        translateApiMessage(error?.message || t("user.profile.manageTeam.failedToLoadRoleList"))
      );
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [getMyBusinessRoles, resolvedBusinessId, t]);

  useFocusEffect(
    useCallback(() => {
      if (!showModal) return;
      loadRoles().catch(() => undefined);
    }, [loadRoles, showModal])
  );

  const openRoleModal = async (employmentId: string) => {
    setSelectedEmploymentId(employmentId);
    const selectedMember = teamMembers.find((member) => member.id === employmentId);
    setSelectedAssignRole(selectedMember?.roleId || undefined);
    setShowModal(true);
    await loadRoles();
  };

  const handleApplyRole = async () => {
    if (!resolvedBusinessId || !selectedEmploymentId || !selectedAssignRole) {
      toast.error(translateApiMessage(t("user.profile.manageTeam.selectRoleRequired")));
      return;
    }

    const selectedRole = roles.find((role) => role.id === selectedAssignRole);
    const nextRoleName = selectedRole?.name || "Not assigned";
    const previousTeam = teamMembers;

    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === selectedEmploymentId
          ? { ...member, role: nextRoleName, roleId: selectedAssignRole }
          : member
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

  const openFireModal = (item: TeamMember) => {
    setSelectedFireEmploymentId(item.id);
    setFireReason("");
    setFireNotes("");
    setFireEffectiveDate(new Date());
    setShowFireModal(true);
  };

  const handleFireEmployee = async () => {
    if (!selectedFireEmploymentId) {
      toast.error(translateApiMessage(t("user.profile.manageTeam.employeeInfoUnavailable")));
      return;
    }

    if (!fireReason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    try {
      setFiringEmployee(true);
      const response = await axiosInstance.patch(
        `/employment/employees/${selectedFireEmploymentId}/terminate`,
        {
          reason: fireReason.trim(),
          notes: fireNotes.trim(),
          effectiveDate: fireEffectiveDate.toISOString(),
        }
      );
      const result = response?.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to terminate employee");
      }

      setTeamMembers((prev) =>
        prev.filter((member) => member.id !== selectedFireEmploymentId)
      );
      toast.success(
        translateApiMessage(result?.message || "employment_updated_successfully")
      );
      setShowFireModal(false);
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to terminate employee"
        )
      );
    } finally {
      setFiringEmployee(false);
    }
  };

  const handleEffectiveDateChange = (selectedDate: Date) => {
    const merged = new Date(fireEffectiveDate);
    merged.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    setFireEffectiveDate(merged);
  };

  const handleApplyWorkingHours = async (payload: {
    workHourPeriod: string | null;
    workHourAmount: number | null;
  }) => {
    if (!selectedWorkingHourEmploymentId) {
      toast.error(translateApiMessage(t("user.profile.manageTeam.employeeInfoUnavailable")));
      return;
    }
    if (!payload.workHourPeriod || payload.workHourAmount == null) {
      toast.error(
        translateApiMessage(t("user.profile.manageTeam.workHoursRequired"))
      );
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
      toast.error(translateApiMessage(t("common.chat.userInfoUnavailable")));
      return;
    }

    try {
      setCreatingChatForUserId(participantId);
      const result = await chatService.createDirectChat(participantId);
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error(t("common.chat.missingRoomId"));
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || t("common.failedToStartChat"))
      );
    } finally {
      setCreatingChatForUserId(null);
    }
  };

  const openUserProfile = (userId: string) => {
    if (!userId) {
      toast.error(translateApiMessage(t("user.profile.manageTeam.employeeInfoUnavailable")));
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
    const isTerminated = item.status === "terminated";

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
              <View className="mt-0.5 flex-row items-center gap-2">
                <Text className="text-sm text-secondary dark:text-dark-secondary">
                  {item.role}
                </Text>
                {isTerminated ? (
                  <View className="px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA]">
                    <Text className="text-[10px] font-proximanova-semibold text-[#DC2626] uppercase">
                      {item.status}
                    </Text>
                  </View>
                ) : null}
              </View>
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
            <TouchableOpacity
              onPress={() => openFireModal(item)}
              disabled={isOwnerRole || isTerminated}
              className={isOwnerRole || isTerminated ? "opacity-40" : ""}
            >
              <Entypo name="dots-three-vertical" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View className="flex-row justify-between mt-4">
            <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
              {t("user.profile.manageTeam.workHoursLabel")}
            </Text>
            <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-semibold">
              {formatWorkHourAmount(
                item.workHourAmount,
                t("common.notSet"),
                t("common.hoursShort")
              )}{" "}
              /{" "}
              {formatWorkHourPeriod(item.workHourPeriod, t("common.notSet"))}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2.5">
            <Text className="text-secondary dark:text-dark-secondary text-sm font-proximanova-regular">
              {t("user.jobs.schedule.location")}:
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
              {t("common.viewProfile")}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#4FB2F3" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => openWorkingHourModal(item)}
              disabled={isTerminated}
              className={`p-1 ${isTerminated ? "opacity-40" : ""}`}
            >
              <AntDesign name="field-time" size={24} color="black" />
            </TouchableOpacity>

            {!isOwnerRole ? (
              <TouchableOpacity
                onPress={() => openRoleModal(item.id)}
                disabled={isTerminated}
                className={`px-5 py-2 rounded-full ${isTerminated ? "bg-[#9CA3AF]" : "bg-[#11293A]"}`}
              >
                <Text className="text-[#ffffff] text-sm font-proximanova-semibold">
                  {t("user.profile.manageTeam.manageRole")}
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 20}
        enabled
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
            title={t("user.profile.manageTeam.titleWithCount", {
              count: teamMembers.length,
            })}
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111111"}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2 mx-5 my-5">
            <EvilIcons name="search" size={24} color="#666" />
            <TextInput
              placeholder={t("common.searchHere")}
              className="ml-2 py-1.5 text-gray-700 dark:text-dark-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              returnKeyType="search"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
            <View pointerEvents="none" className="pb-10">
              {skeletonTeamMembers.map((item) => (
                <AutoSkeletonView key={item.id} isLoading={true} defaultRadius={24}>
                  <TeamMemberCardSkeleton />
                </AutoSkeletonView>
              ))}
            </View>
          ) : (
            <FlatList
              data={filteredTeamMembers}
              renderItem={renderTeamMember}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="px-5 pt-10">
                  <StatusStateCard
                    image={require("@/assets/images/male.svg")}
                    title={t("user.profile.manageTeam.emptyTitle")}
                    text={t("user.profile.manageTeam.emptyText")}
                  />
                </View>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>

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
        emptyStateText={t("user.profile.manageTeam.noRolesFound")}
        loading={rolesLoading}
        onApply={handleApplyRole}
        applying={assigningRole}
        selectedAssignRole={selectedAssignRole}
        setSelectedAssignRole={setSelectedAssignRole}
      />

      <Modal
        visible={showFireModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowFireModal(false);
        }}
      >
        <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setShowFireModal(false);
            }}
            className="absolute inset-0"
          />

          <View
            style={{ flex: 1, justifyContent: "flex-end", paddingBottom: fireModalKeyboardInset }}
          >
            <View
              className="bg-white rounded-t-3xl"
              style={{ maxHeight: fireModalKeyboardInset > 0 ? "82%" : "85%" }}
            >
              <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
                <TouchableOpacity
                  onPress={() => {
                    setShowFireModal(false);
                  }}
                >
                  <View className="bg-[#000] rounded-full p-2.5">
                    <Entypo name="cross" size={30} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              <View className="px-6 pt-8 pb-3">
                <Text className="font-proximanova-bold text-xl text-center text-primary">
                  Fire Employee
                </Text>
                <Text className="font-proximanova-regular text-sm text-center text-secondary mt-2">
                  This will terminate the selected employee.
                </Text>
              </View>

              <ScrollView
                className="px-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <Text className="font-proximanova-regular text-sm text-secondary mb-2">Reason</Text>
                <TextInput
                  value={fireReason}
                  onChangeText={setFireReason}
                  placeholder="Performance issues"
                  placeholderTextColor="#999"
                  className="font-proximanova-regular border border-[#EEEEEE] rounded-xl px-3 py-2 text-primary mb-3"
                />

                <Text className="font-proximanova-regular text-sm text-secondary mb-2">Notes</Text>
                <TextInput
                  value={fireNotes}
                  onChangeText={setFireNotes}
                  placeholder="Employee was given multiple warnings..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  className="font-proximanova-regular border border-[#EEEEEE] rounded-xl px-3 py-2 text-primary min-h-[92px] mb-3"
                />

                <Text className="font-proximanova-regular text-sm text-secondary mb-2">Effective Date</Text>
                <DatePicker
                  className="mb-3"
                  value={fireEffectiveDate}
                  onChange={handleEffectiveDateChange}
                />
              </ScrollView>

              <View className="px-6 pb-7 flex-row gap-3">
                <PrimaryButton
                  title="Cancel"
                  onPress={() => {
                    setShowFireModal(false);
                  }}
                  disabled={firingEmployee}
                  showIcon={false}
                  className="flex-1 bg-[#11293A] rounded-xl py-3 px-4"
                />
                <PrimaryButton
                  title={firingEmployee ? "Firing..." : "Fire"}
                  onPress={handleFireEmployee}
                  disabled={firingEmployee}
                  showIcon={false}
                  className="flex-1 bg-[#EF4444] rounded-xl py-3 px-4"
                />
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageTeamPanel;
