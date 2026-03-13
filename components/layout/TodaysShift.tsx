import { useBusinessStore } from "@/stores/businessStore";
import { useAuthStore } from "@/stores/authStore";
import { useShiftStore } from "@/stores/shiftStore";
import { ApiShift, ShiftCardData, TodaysShiftProps } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import { formatUTCToLocalTime, utcTimeToLocal } from "@/utils/timezone";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { toast } from "sonner-native";
import ActionCard from "../ui/cards/ActionCard";
import NoTaskCard from "../ui/cards/NoTaskCard";
import TaskCard from "../ui/cards/TaskCard";
import BusinessSelectionTrigger from "../ui/dropdown/BusinessSelectionTrigger";
import LogoutDeleteModal from "../ui/modals/LogoutDeleteModal";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

const TodaysShift = ({ className }: TodaysShiftProps) => {
  const shiftLogoutImg = require("@/assets/images/Logout.svg");
  const [showModal, setShowModal] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [pendingLogoutShiftId, setPendingLogoutShiftId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const isFocused = useIsFocused();
  const {
    myBusinesses,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyBusinesses,
  } = useBusinessStore();
  const { homeShifts, homeShiftsLoading, fetchHomeShifts, clockIn, clockOut } =
    useShiftStore();
  const accessToken = useAuthStore((state) => state.accessToken);

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

  useFocusEffect(
    useCallback(() => {
      if (!accessToken || !isFocused) return;

      fetchHomeShifts(selectedBusinesses).catch((error) => {
        console.error("[TodaysShift] fetchHomeShifts error:", error);
      });
    }, [accessToken, fetchHomeShifts, isFocused, selectedBusinesses])
  );

  const handleShiftAction = useCallback(
    async (card: ShiftCardData) => {
      if (!card.id) {
        toast.error("Shift assignment not found");
        return;
      }

      if (card.presentStatus === "logged_in") {
        setPendingLogoutShiftId(card.id);
        setIsLogoutModalVisible(true);
        return;
      }

      try {
        const result = await clockIn(card.id);
        toast.success(
          translateApiMessage(result?.message || "successfully_clocked_in")
        );
      } catch (error: any) {
        toast.error(
          translateApiMessage(
            error?.message ||
              "attendance_shift_assignment_not_found_or_access_denied"
          )
        );
      }
    },
    [clockIn]
  );

  const handleConfirmLogout = useCallback(async () => {
    if (!pendingLogoutShiftId) {
      setIsLogoutModalVisible(false);
      return;
    }

    try {
      const result = await clockOut(pendingLogoutShiftId);
      toast.success(
        translateApiMessage(result?.message || "successfully_clocked_out")
      );
      setIsLogoutModalVisible(false);
      setPendingLogoutShiftId(null);
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.message ||
            "attendance_shift_assignment_not_found_or_access_denied"
        )
      );
    }
  }, [clockOut, pendingLogoutShiftId]);

  const handleCloseLogoutModal = useCallback(() => {
    setIsLogoutModalVisible(false);
    setPendingLogoutShiftId(null);
  }, []);

  const extractHourMinute = useCallback((value?: string) => {
    if (!value) return null;

    if (value.includes("T")) {
      // ISO timestamp - convert from UTC using selected app timezone.
      const localTime = formatUTCToLocalTime(value);
      if (localTime && localTime !== "-") {
        const [timePart = "00:00", periodPart = "AM"] = localTime.split(" ");
        const [rawHour = "0", rawMinute = "0"] = timePart.split(":");
        const baseHour = Number(rawHour);
        const minute = Number(rawMinute);
        if (!Number.isNaN(baseHour) && !Number.isNaN(minute)) {
          const normalizedHour = periodPart === "PM" && baseHour !== 12
            ? baseHour + 12
            : periodPart === "AM" && baseHour === 12
              ? 0
              : baseHour;
          return { hour: normalizedHour, minute };
        }
      }
    }

    // HH:mm format - convert from UTC to local
    const localTime = utcTimeToLocal(value);
    const [rawHour = "0", rawMinute = "0"] = localTime.split(":");
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

    return { hour, minute };
  }, []);

  const to12Hour = useCallback((value?: string) => {
    const parsed = extractHourMinute(value);
    if (!parsed || typeof parsed === "string") return "--:--";
    const { hour, minute } = parsed;
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
  }, [extractHourMinute]);

  const getShiftStatus = useCallback(
    (shift: ApiShift): ShiftCardData["status"] => {
      const startIso = shift?.startsAt;
      const endIso = shift?.endsAt;
      const now = new Date();
      const shiftStart = new Date(startIso || shift?.date || Date.now());
      const shiftEnd = new Date(endIso || shift?.date || Date.now());

      if (!Number.isNaN(shiftStart.getTime()) && !Number.isNaN(shiftEnd.getTime())) {
        if (now < shiftStart) return "upcoming";
        if (now <= shiftEnd) return "ongoing";

        if (shift?.status === "missed") return "missed";
        if (shift?.status === "early_leave") return "early_leave";
        return "completed";
      }

      if (
        shift?.status === "ongoing" ||
        shift?.status === "upcoming" ||
        shift?.status === "completed" ||
        shift?.status === "early_leave" ||
        shift?.status === "missed"
      ) {
        return shift.status;
      }

      return "upcoming";
    },
    []
  );

  const cards = useMemo<ShiftCardData[]>(() => {
    const source = Array.isArray(homeShifts) ? (homeShifts as ApiShift[]) : [];

    const filtered =
      selectedBusinesses.length === 0
        ? source
        : source.filter((shift) =>
          selectedBusinesses.includes(shift?.business?.id || "")
        );

    const afterItemTypeFilter = filtered.filter(
      (shift) =>
        shift?.itemType !== "empty_day" &&
        shift?.status !== "no_shift" &&
        shift?.shiftTemplate
    );

    return afterItemTypeFilter.map((shift) => {
      const business = shift?.business;
      const addressPayload = business?.address;
      const address = typeof addressPayload === "string" ? addressPayload : addressPayload?.address || addressPayload?.line1 || "Address unavailable";
      const city = typeof addressPayload === "string" ? "" : addressPayload?.city || "";
      return {
        id: shift.id || `${business?.id || "business"}-${shift?.date || "date"}`,
        shiftTitle: shift?.shiftTemplate?.name || business?.name || "Shift",
        startTime: shift?.startsAt
          ? formatUTCToLocalTime(shift.startsAt)
          : to12Hour(shift?.shiftTemplate?.startTime),
        endTime: shift?.endsAt
          ? formatUTCToLocalTime(shift.endsAt)
          : to12Hour(shift?.shiftTemplate?.endTime),
        startsAt: shift?.startsAt,
        endsAt: shift?.endsAt,
        startDateTime: shift?.startsAt,
        endDateTime: shift?.endsAt,
        shiftImage: business?.logo || require("@/assets/images/placeholder.png"),
        teamMembers: Array.isArray(shift?.colleagueAvatars) ? shift.colleagueAvatars.map((_, index) => `Member ${index + 1}`) : [],
        totalMembers: typeof shift?.totalMembers === "number" ? shift.totalMembers : 0,
        address,
        city,
        status: getShiftStatus(shift),
        presentStatus: shift?.presentStatus || "logged_out",
      };
    });
  }, [getShiftStatus, homeShifts, selectedBusinesses, to12Hour]);

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

  return (
    <View className={`${className} px-4`}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-proximanova-semibold">
          Your Today&apos;s Shifts
        </Text>

        <BusinessSelectionTrigger
          displayContent={displayContent as any}
          onPress={() => setShowModal(true)}
        />
      </View>

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

      {/* cards */}
      {(homeShiftsLoading || cards.length > 0) && (
        <ScrollView
          className="mb-7"
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        >
          {homeShiftsLoading ? (
            <View className="w-full py-8 items-center justify-center">
              <ActivityIndicator size="small" color="#4FB2F3" />
            </View>
          ) : (
            cards.map((card) => (
              <TaskCard
                key={card.id}
                shiftTitle={card.shiftTitle}
                startTime={card.startTime}
                endTime={card.endTime}
                startsAt={card.startsAt}
                endsAt={card.endsAt}
                startDateTime={card.startDateTime}
                endDateTime={card.endDateTime}
                shiftImage={card.shiftImage}
                teamMembers={card.teamMembers}
                totalMembers={card.totalMembers}
                address={card.address}
                city={card.city}
                presentStatus={card.presentStatus}
                onLoginPress={() => handleShiftAction(card)}
                onLogoutPress={() => handleShiftAction(card)}
                status={card.status}
              />
            ))
          )}
        </ScrollView>
      )}

      {!homeShiftsLoading && cards.length === 0 && <NoTaskCard className="mb-7" />}

      {/* rank card */}
      <ActionCard
        title="See your rank on board"
        buttonTitle="View"
        onPress={() => router.push("/screens/home/leaderboard")}
        rightImage={require("@/assets/images/rank.svg")}
        imageClass="absolute bottom-0 right-2.5"
        imageWidth={144}
        imageHeight={95}
        background={require("@/assets/images/chessboard-bg.svg")}
      />

      <LogoutDeleteModal
        visible={isLogoutModalVisible}
        onClose={handleCloseLogoutModal}
        data={{
          img: shiftLogoutImg,
          title: "Log out from this shift?",
          subtitle:
            "You can log back in anytime during your active shift window.",
          buttonName: "Logout",
          buttonColor: "#EF4444",
        }}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
};

export default TodaysShift;

