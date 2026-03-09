import ShiftCard from "@/components/ui/cards/ShiftCard";
import AnimatedFABMenu from "@/components/ui/dropdown/AnimatedFabMenu";
import BusinessSelectionTrigger from "@/components/ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import UserCalendarScheduleModal from "@/components/ui/modals/UserCalendarScheduleModal";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { RelativePathString, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const resolveMediaUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return undefined;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
};

const toYmd = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BusinessScheduleScreen = () => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() =>
    toYmd(new Date())
  );
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedShiftTemplateId, setSelectedShiftTemplateId] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [roleOptions, setRoleOptions] = useState<{ id: string; label: string }[]>([]);
  const [shiftTemplateOptions, setShiftTemplateOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const [showModal, setShowModal] = useState(false);
  const {
    myBusinesses,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyBusinesses,
    getMyBusinessRoles,
    getShiftTemplates,
  } = useBusinessStore();
  const {
    businessAssignments,
    businessAssignmentsLoading,
    businessAssignmentsPagination,
    fetchBusinessAssignments,
  } = useShiftStore();

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        await getMyBusinesses();
      } catch {
        // ignore
      }
    };

    loadBusinesses();
  }, [getMyBusinesses]);

  useEffect(() => {
    const businessId = selectedBusinesses?.[0];
    if (!businessId) return;

    setCurrentPage(1);
    fetchBusinessAssignments(businessId, {
      page: 1,
      limit: pageSize,
      date: selectedCalendarDate,
      shiftTemplateId:
        selectedShiftTemplateId !== "all" ? selectedShiftTemplateId : undefined,
      append: false,
    }).catch((error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load shifts");
    });
  }, [
    fetchBusinessAssignments,
    selectedBusinesses,
    selectedCalendarDate,
    selectedShiftTemplateId,
  ]);

  useEffect(() => {
    const businessId = selectedBusinesses?.[0];
    if (!businessId) {
      setRoleOptions([]);
      setSelectedFilter("all");
      return;
    }

    getMyBusinessRoles(businessId)
      .then((data: any[]) => {
        const normalized = (Array.isArray(data) ? data : [])
          .map((item: any) => ({
            id: item?.id || item?.roleId || "",
            label: item?.role?.name || item?.name || "",
          }))
          .filter((item: any) => item.id && item.label);
        setRoleOptions(normalized);
      })
      .catch(() => {
        setRoleOptions([]);
      });
  }, [getMyBusinessRoles, selectedBusinesses]);

  useEffect(() => {
    const businessId = selectedBusinesses?.[0];
    if (!businessId) {
      setShiftTemplateOptions([]);
      setSelectedShiftTemplateId("all");
      return;
    }

    getShiftTemplates(businessId)
      .then((data: any[]) => {
        const templates = (Array.isArray(data) ? data : [])
          .map((item: any) => ({
            id: item?.id || "",
            name: item?.name || "",
          }))
          .filter((item: any) => item.id && item.name);
        setShiftTemplateOptions(templates);
      })
      .catch(() => {
        setShiftTemplateOptions([]);
      });
  }, [getShiftTemplates, selectedBusinesses]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await getMyBusinesses();

      const businessId = selectedBusinesses?.[0];
      if (!businessId) return;

      setCurrentPage(1);

      await Promise.all([
        fetchBusinessAssignments(businessId, {
          page: 1,
          limit: pageSize,
          date: selectedCalendarDate,
          shiftTemplateId:
            selectedShiftTemplateId !== "all" ? selectedShiftTemplateId : undefined,
          append: false,
        }),
        getMyBusinessRoles(businessId).then((data: any[]) => {
          const normalized = (Array.isArray(data) ? data : [])
            .map((item: any) => ({
              id: item?.id || item?.roleId || "",
              label: item?.role?.name || item?.name || "",
            }))
            .filter((item: any) => item.id && item.label);
          setRoleOptions(normalized);
        }),
        getShiftTemplates(businessId).then((data: any[]) => {
          const templates = (Array.isArray(data) ? data : [])
            .map((item: any) => ({
              id: item?.id || "",
              name: item?.name || "",
            }))
            .filter((item: any) => item.id && item.name);
          setShiftTemplateOptions(templates);
        }),
      ]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = myBusinesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      return { type: "single", content: selectedBusiness };
    }
    return { type: "multi", content: `${selectedBusinesses.length} Selected` };
  };

  const displayContent = getDisplayContent();

  const to12Hour = (value?: string) => {
    if (!value) return "--:--";
    const [rawHour = "0", rawMinute = "0"] = value.split(":");
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
  };

  const toHourSlotLabel = (hour: number) => {
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const meridiem = hour >= 12 ? "PM" : "AM";
    return { hour12, meridiem };
  };

  const shifts = useMemo(() => {
    const items = Array.isArray(businessAssignments) ? businessAssignments : [];
    return items
      .filter((item: any) => item?.itemType === "assigned_shift")
      .map((item: any) => {
        const startTime = item?.shiftTemplate?.startTime;
        const endTime = item?.shiftTemplate?.endTime;
        const startsAtIso = item?.startsAt;
        const startsAtDate = startsAtIso ? new Date(startsAtIso) : null;
        const isValidStartDate =
          startsAtDate instanceof Date && !Number.isNaN(startsAtDate.getTime());
        const templateHour = Number((startTime || "0:00").split(":")[0] || "0");
        const startHour =
          isValidStartDate
            ? startsAtDate.getHours()
            : Number.isNaN(templateHour)
              ? 0
              : templateHour;
        const shiftTemplateName = item?.shiftTemplate?.name || "Shift";
        const shiftTemplateId = item?.shiftTemplate?.id || "";
        const roleName =
          item?.employment?.roleName ||
          item?.employment?.role?.name ||
          "Team Member";
        const displayName =
          item?.employment?.name ||
          item?.employment?.email ||
          "Employee";

        return {
          id: item?.id,
          name: displayName,
          roleId: item?.employment?.roleId || "",
          role: roleName,
          avatar: resolveMediaUrl(item?.employment?.avatar),
          shiftDateYmd: isValidStartDate ? toYmd(startsAtDate) : null,
          startHour,
          shiftTemplateId,
          shiftTemplateName,
          shiftTime: `${to12Hour(startTime)} - ${to12Hour(endTime)}`,
          location: item?.business?.address?.address || "-",
          status: item?.status || "upcoming",
        };
      });
  }, [businessAssignments]);

  useEffect(() => {
    if (selectedShiftTemplateId === "all") return;
    const exists = shiftTemplateOptions.some((item) => item.id === selectedShiftTemplateId);
    if (!exists) setSelectedShiftTemplateId("all");
  }, [selectedShiftTemplateId, shiftTemplateOptions]);

  const shiftFilteredShifts = useMemo(() => {
    if (selectedShiftTemplateId === "all") return shifts;
    return shifts.filter((item: any) => item.shiftTemplateId === selectedShiftTemplateId);
  }, [selectedShiftTemplateId, shifts]);

  const timeSlotFilters = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        id: hour,
        ...toHourSlotLabel(hour),
      })),
    []
  );

  const timeFilteredShifts = useMemo(() => {
    if (selectedTimeSlot === null) return shiftFilteredShifts;
    return shiftFilteredShifts.filter((item: any) => item.startHour === selectedTimeSlot);
  }, [selectedTimeSlot, shiftFilteredShifts]);

  const roleFilters = useMemo(() => {
    const roles = roleOptions.map((role) => ({
      id: role.id,
      label: role.label,
      count: timeFilteredShifts.filter((item: any) => item?.roleId === role.id).length,
    }));

    return [
      { id: "all", label: "All", count: timeFilteredShifts.length },
      ...roles,
    ];
  }, [roleOptions, timeFilteredShifts]);

  useEffect(() => {
    const hasSelected = roleFilters.some((item) => item.id === selectedFilter);
    if (!hasSelected) setSelectedFilter("all");
  }, [roleFilters, selectedFilter]);

  const visibleShifts = useMemo(() => {
    if (selectedFilter === "all") return timeFilteredShifts;
    return timeFilteredShifts.filter((item: any) => item?.roleId === selectedFilter);
  }, [selectedFilter, timeFilteredShifts]);

  const headerTitle = useMemo(() => {
    if (selectedShiftTemplateId === "all") {
      return `All Shifts (${visibleShifts.length})`;
    }
    const selectedTemplate = shiftTemplateOptions.find(
      (item) => item.id === selectedShiftTemplateId
    );
    return `${selectedTemplate?.name || "Shift"} (${visibleShifts.length})`;
  }, [selectedShiftTemplateId, shiftTemplateOptions, visibleShifts.length]);

  const headerTimeRange = useMemo(() => {
    if (visibleShifts.length === 0) return "--";
    return visibleShifts[0]?.shiftTime || "--";
  }, [visibleShifts]);

  const headerDateLabel = useMemo(() => {
    const parsed = new Date(selectedCalendarDate);
    if (Number.isNaN(parsed.getTime())) return "Select Date";
    return parsed.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [selectedCalendarDate]);

  const handleLoadMore = async () => {
    const businessId = selectedBusinesses?.[0];
    if (!businessId) return;
    if (isFetchingMore || businessAssignmentsLoading) return;
    if (!businessAssignmentsPagination?.hasNext) return;

    const nextPage = (businessAssignmentsPagination?.page || currentPage) + 1;

    try {
      setIsFetchingMore(true);
      await fetchBusinessAssignments(businessId, {
        page: nextPage,
        limit: pageSize,
        date: selectedCalendarDate,
        shiftTemplateId:
          selectedShiftTemplateId !== "all" ? selectedShiftTemplateId : undefined,
        append: true,
      });
      setCurrentPage(nextPage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load more");
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const threshold = 80;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold) {
      handleLoadMore();
    }
  };

  const checkAndNavigate = (route: RelativePathString) => {
    if (selectedBusinesses.length === 0) {
      setShowModal(true)
    } else {
      router.push(route)
    }
  }

  const menuItems = [
    {
      id: 1,
      title: "Create Role",
      icon: "create-outline",
      onPress: () => {
        checkAndNavigate("/screens/schedule/business/all-created-role" as RelativePathString)
        // router.push("/screens/schedule/business/all-created-role");
      },
    },
    {
      id: 2,
      title: "Create Template",
      icon: "document-text-outline",
      onPress: () => {
        checkAndNavigate("/screens/schedule/business/create-template" as RelativePathString)
        // router.push("/screens/schedule/business/create-template");
      },
    },
    {
      id: 3,
      title: "Saved Shift Template",
      icon: "document-attach-outline",
      onPress: () => {
        checkAndNavigate("/screens/schedule/business/saved-shift-template" as RelativePathString)
        // router.push("/screens/schedule/business/saved-shift-template");
      },
    },
    {
      id: 4,
      title: "Weekly Schedule",
      icon: "calendar-clear-outline",
      onPress: () => {
        checkAndNavigate("/screens/schedule/business/weekly-schedule" as RelativePathString)
        // router.push("/screens/schedule/business/weekly-schedule");
      },
    },
    {
      id: 5,
      title: "Manage Weekly Schedules",
      icon: "calendar-outline",
      onPress: () => {
        checkAndNavigate("/screens/schedule/business/manage-weekly-schedules" as RelativePathString);
      },
    },
  ];

  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="pt-2.5 pb-5">
        <View className="flex-row items-center justify-between mb-4 px-5">
          {/* left */}
          <View>
            <Text className="font-proximanova-regular text-primary">
              All Shift
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={() => setCalendarModalVisible(true)}
            >
              <Text className="text-xl font-proximanova-bold text-primary">
                {headerDateLabel}
              </Text>
              <Ionicons name="chevron-down" size={18} color="black" />
            </TouchableOpacity>
          </View>

          {/* right */}
          <View className="flex-row gap-3">
            {/* calendar */}
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/screens/schedule/business/create-holiday/calendar"
                )
              }
              className="w-10 h-10 items-center justify-center bg-[#F5F5F5] rounded-full"
            >
              <Ionicons name="calendar-outline" size={20} color="black" />
            </TouchableOpacity>

            {/* notification */}
            <TouchableOpacity
              onPress={() => router.push("/shared/notification")}
              className="w-10 h-10 items-center justify-center bg-[#F5F5F5] rounded-full"
            >
              <Image
                source={require("@/assets/images/bell.svg")}
                style={{
                  width: 20,
                  height: 20,
                }}
                contentFit="contain"
              />
              <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
                <Text className="text-[10px] text-white">1</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shift Type Selector */}
        <View className="mb-5 flex-row items-center">
          {/* business selection */}
          <View className="pl-5">
            <BusinessSelectionTrigger
              displayContent={displayContent as any}
              onPress={() => setShowModal(true)}
            />
          </View>

          {/* shift selection */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, alignItems: "center" }}
          >
            <TouchableOpacity
              onPress={() => setSelectedShiftTemplateId("all")}
              className="px-2.5 py-1"
            >
              <Text
                className={`text-sm ${selectedShiftTemplateId === "all"
                  ? "text-primary font-proximanova-semibold"
                  : "text-secondary"
                  }`}
              >
                All
              </Text>
            </TouchableOpacity>

            {shiftTemplateOptions.length > 0 ? <Text className="text-secondary">|</Text> : null}

            {shiftTemplateOptions.map((template, index) => (
              <React.Fragment key={template.id}>
                <TouchableOpacity
                  onPress={() => setSelectedShiftTemplateId(template.id)}
                  className="px-2.5 py-1"
                >
                  <Text
                    className={`text-sm ${selectedShiftTemplateId === template.id
                      ? "text-primary font-proximanova-semibold"
                      : "text-secondary"
                      }`}
                  >
                    {template.name}
                  </Text>
                </TouchableOpacity>

                {index !== shiftTemplateOptions.length - 1 ? (
                  <Text className="text-secondary">|</Text>
                ) : null}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        {/* time selector */}
        <ScrollView
          horizontal
          className="mb-5 pl-5"
          contentContainerStyle={{
            paddingRight: 40
          }}
          showsHorizontalScrollIndicator={false}
        >
          {timeSlotFilters.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                setSelectedTimeSlot((prev) => (prev === item.id ? null : item.id))
              }
              className={`w-8 h-14 items-center justify-center rounded-2xl mr-3 ${selectedTimeSlot === item.id
                ? "bg-[#4FB2F3]"
                : "bg-white border border-[#EEEEEE]"
                }`}
            >
              <Text
                className={`font-proximanova-bold ${selectedTimeSlot === item.id ? "text-white" : "text-primary"
                  }`}
              >
                {item.hour12}
              </Text>
              <Text
                className={`text-xs font-proximanova-regular mt-1 ${selectedTimeSlot === item.id ? "text-white" : "text-gray-600"
                  }`}
              >
                {item.meridiem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* role filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5"
        >
          {roleFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              className={`px-2.5 py-2 rounded-full mr-3 ${selectedFilter === filter.id ? "bg-[#4FB2F3]" : "bg-gray-100"
                }`}
            >
              <Text
                className={` text-sm ${selectedFilter === filter.id
                  ? "text-white font-proximanova-semibold"
                  : "text-primary font-proximanova-regular"
                  }`}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Shifts List */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={handleListScroll}
        scrollEventThrottle={100}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-proximanova-semibold text-primary">
            {headerTitle}
          </Text>
          <Text className="text-sm font-proximanova-regular text-secondary">
            {headerTimeRange}
          </Text>
        </View>

        {businessAssignmentsLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : visibleShifts.length > 0 ? (
          visibleShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
        ) : (
          <Text className="text-sm font-proximanova-regular text-secondary">
            No shifts found.
          </Text>
        )}
        {isFetchingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : null}
      </ScrollView>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={myBusinesses.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          imageUrl: b.logo,
          logo: b.logo,
        }))}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />
      <UserCalendarScheduleModal
        visible={isCalendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        selectedDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
      />

      {/* add icon */}
      <AnimatedFABMenu
        menuItems={menuItems}
        fabColor="#11293A"
        menuItemColor="#11293A"
      />
    </SafeAreaView>
  );
};

export default BusinessScheduleScreen;
