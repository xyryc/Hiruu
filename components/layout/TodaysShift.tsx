import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { TodaysShiftProps } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import ActionCard from "../ui/cards/ActionCard";
import NoTaskCard from "../ui/cards/NoTaskCard";
import TaskCard from "../ui/cards/TaskCard";
import BusinessSelectionTrigger from "../ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

type ApiShift = {
  itemType?: "assigned_shift" | "empty_day";
  id?: string;
  date?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  hasNextShift?: boolean;
  nextShiftStartDate?: string;
  totalMembers?: number;
  colleagueAvatars?: string[];
  shiftTemplate?: {
    name?: string;
    startTime?: string;
    endTime?: string;
  };
  business?: {
    id?: string;
    name?: string;
    logo?: string | null;
    address?:
      | string
      | {
          line1?: string;
          address?: string;
          city?: string;
          state?: string;
          country?: string;
        };
  };
};

type ShiftCardData = {
  id: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  startsAt?: string;
  endsAt?: string;
  startDateTime?: string;
  endDateTime?: string;
  shiftImage: any;
  teamMembers: string[];
  totalMembers: number;
  address: string;
  city: string;
  status: "ongoing" | "upcoming" | "completed" | "missed";
};

const TodaysShift = ({ className }: TodaysShiftProps) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const {
    myBusinesses,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyBusinesses,
  } = useBusinessStore();
  const { homeShifts, homeShiftsLoading, fetchHomeShifts } = useShiftStore();

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
    fetchHomeShifts(selectedBusinesses).catch(() => {
      // ignore
    });
  }, [fetchHomeShifts, selectedBusinesses]);

  const handleLogin = () => {
    console.log("Login pressed");
  };

  const extractHourMinute = useCallback((value?: string) => {
    if (!value) return null;

    if (value.includes("T")) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        // API sends ISO with UTC suffix (Z); use UTC clock to preserve shift time.
        return { hour: date.getUTCHours(), minute: date.getUTCMinutes() };
      }
    }

    const [rawHour = "0", rawMinute = "0"] = value.split(":");
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
      if (
        shift?.status === "ongoing" ||
        shift?.status === "upcoming" ||
        shift?.status === "completed" ||
        shift?.status === "missed"
      ) {
        return shift.status;
      }

      const startIso = shift?.startsAt;
      const endIso = shift?.endsAt;
      const now = new Date();
      const shiftStart = new Date(startIso || shift?.date || Date.now());
      const shiftEnd = new Date(endIso || shift?.date || Date.now());

      if (Number.isNaN(shiftStart.getTime()) || Number.isNaN(shiftEnd.getTime())) {
        return "upcoming";
      }

      if (now >= shiftStart && now <= shiftEnd) return "ongoing";
      if (now < shiftStart) return "upcoming";
      return "completed";
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

    return filtered
      .filter(
        (shift) =>
          shift?.itemType !== "empty_day" &&
          shift?.status !== "no_shift" &&
          shift?.shiftTemplate
      )
      .map((shift) => {
        const business = shift?.business;
        const addressPayload = business?.address;
        const address =
          typeof addressPayload === "string"
            ? addressPayload
            : addressPayload?.line1 ||
              addressPayload?.address ||
              "Address unavailable";
        const city =
          typeof addressPayload === "string"
            ? "Location unavailable"
            : [addressPayload?.city, addressPayload?.state]
                .filter(Boolean)
                .join(", ") ||
              addressPayload?.country ||
              "Location unavailable";

        return {
          id: shift.id || `${business?.id || "business"}-${shift?.date || "date"}`,
          shiftTitle: shift?.shiftTemplate?.name || business?.name || "Shift",
          startTime: to12Hour(shift?.shiftTemplate?.startTime || shift?.startsAt),
          endTime: to12Hour(shift?.shiftTemplate?.endTime || shift?.endsAt),
          startsAt: shift?.startsAt,
          endsAt: shift?.endsAt,
          startDateTime: shift?.startsAt,
          endDateTime: shift?.endsAt,
          shiftImage: business?.logo || require("@/assets/images/placeholder.png"),
          teamMembers: Array.isArray(shift?.colleagueAvatars)
            ? shift.colleagueAvatars.map((_, index) => `Member ${index + 1}`)
            : [],
          totalMembers:
            typeof shift?.totalMembers === "number" ? shift.totalMembers : 0,
          address,
          city,
          status: getShiftStatus(shift),
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
                onLoginPress={handleLogin}
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
    </View>
  );
};

export default TodaysShift;
