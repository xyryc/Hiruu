import { useAuthStore } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import type { JobCardProps } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import { Entypo, Fontisto, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SimpleStatusBadge from "../badges/SimpleStatusBadge";
import PrimaryButton from "../buttons/PrimaryButton";
import SmallButton from "../buttons/SmallButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type JobApplyModalProps = {
  visible: boolean;
  onClose: () => void;
  job?: JobCardProps["job"];
};

const resolveMediaUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return value;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
};

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

const JobApplyModal = ({ visible, onClose, job }: JobApplyModalProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const router = useRouter();
  const applyToRecruitment = useJobStore((s) => s.applyToRecruitment);
  const user = useAuthStore((s) => s.user as any);

  const recruitmentId = job?.id;
  const businessId = job?.business?.id || job?.businessId;
  const companyName = job?.business?.name || "Business";
  const roleName = job?.role?.role?.name || job?.name || "Role";
  const locationLabel = job?.business?.address?.address || "Unknown Location";
  const companyLogo =
    resolveMediaUrl(job?.business?.logo) || require("@/assets/images/placeholder.png");
  const hasSalary =
    typeof job?.salaryMin === "number" && typeof job?.salaryMax === "number";
  const salarySuffix = job?.salaryType === "monthly" ? "/mo" : "/hr";
  const salaryLabel = hasSalary
    ? `${job.salaryMin}-${job.salaryMax}$${salarySuffix}`
    : "-";
  const shiftLabel =
    job?.shiftStartTime && job?.shiftEndTime
      ? `${to12Hour(job.shiftStartTime)} - ${to12Hour(job.shiftEndTime)}`
      : job?.shiftType || "-";
  const distanceLabel =
    typeof job?.distanceKm === "number" ? `${job.distanceKm} Km Away` : null;

  const isAlreadyEmployed = React.useMemo(() => {
    const employments = Array.isArray(user?.employments) ? user.employments : [];
    if (employments.length === 0) return false;

    const isActiveEmployment = (employment: any) => {
      const status = String(employment?.status || "").toLowerCase();
      return !status || status === "active" || status === "accepted" || status === "approved";
    };

    if (businessId) {
      return employments.some(
        (employment: any) =>
          isActiveEmployment(employment) &&
          (employment?.businessId === businessId ||
            employment?.business?.id === businessId)
      );
    }

    return employments.some((employment: any) => isActiveEmployment(employment));
  }, [businessId, user?.employments]);

  useEffect(() => {
    if (!visible) {
      setShowDetails(false);
      setApplyError(null);
      return;
    }

    if (isAlreadyEmployed) {
      setApplyError(translateApiMessage("already_employed"));
    } else {
      setApplyError(null);
    }
  }, [isAlreadyEmployed, visible]);

  useEffect(() => {
    if (showDetails) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_WIDTH);
    }
  }, [showDetails, slideAnim]);

  const handleDone = () => {
    if (showDetails) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowDetails(false);
        onClose();
      });
      return;
    }

    onClose();
  };

  const handleApplyNow = async () => {
    if (!recruitmentId || isApplying || isAlreadyEmployed) {
      if (!recruitmentId) {
        setApplyError("Recruitment id is missing");
      }
      if (isAlreadyEmployed) {
        setApplyError(translateApiMessage("already_employed"));
      }
      return;
    }

    try {
      setApplyError(null);
      setIsApplying(true);
      await applyToRecruitment(String(recruitmentId));
      setShowDetails(true);
    } catch (error: any) {
      const message = error?.message || "Failed to apply";
      setApplyError(message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleBackToJobBoard = () => {
    handleDone();
    setShowDetails(false);
    router.replace("/(tabs)/user-jobs");
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-5 py-7 items-center">
            <Image
              source={companyLogo}
              style={{
                width: 100,
                height: 100,
                borderRadius: 999,
              }}
              contentFit="cover"
            />

            <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary mt-2.5">
              {companyName}
            </Text>

            <View className="flex-row items-center justify-center mt-2.5 gap-7">
              <View className="flex-row items-center gap-2.5 border-r-hairline border-[#7A7A7A] pr-7">
                <SimpleLineIcons
                  name="location-pin"
                  size={20}
                  color="#7A7A7A"
                />
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {locationLabel}
                </Text>
              </View>

              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                4.8/5 <Fontisto name="star" size={14} color="#F1C400" />
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center justify-center gap-2.5 mt-2.5">
              <SimpleStatusBadge title={`Hiring: ${roleName}`} bgColor="#F5F5F5" />
              <SimpleStatusBadge title={`Salary: ${salaryLabel}`} bgColor="#F5F5F5" />
              <SimpleStatusBadge title={`Shift: ${shiftLabel}`} bgColor="#F5F5F5" />
              {distanceLabel ? (
                <SimpleStatusBadge title={distanceLabel} bgColor="#F5F5F5" />
              ) : null}
            </View>

            <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
              To apply for this job, please share Details so the business can
              contact you.
            </Text>
            {applyError ? (
              <Text className="text-sm font-proximanova-semibold text-[#F34F4F] text-center mt-2">
                {applyError}
              </Text>
            ) : null}

            <PrimaryButton
              title={isAlreadyEmployed ? "Already Employed" : isApplying ? "Applying..." : "Apply Now"}
              className="mt-7"
              onPress={handleApplyNow}
              disabled={isApplying || isAlreadyEmployed}
            />
          </SafeAreaView>

          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <SafeAreaView
              edges={["bottom"]}
              className="flex-1 px-5 py-7 justify-center"
            >
              <Image
                source={require("@/assets/images/complete.svg")}
                style={{
                  width: 156,
                  height: 120,
                  alignSelf: "center",
                }}
                contentFit="cover"
              />

              <Text className="text-center text-lg font-proximanova-semibold mt-3 mb-2">
                Application Sent! successfully
              </Text>

              <Text className="w-4/6 mx-auto text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
                You applied to {companyName}. They may contact you soon. Good
                luck!
              </Text>

              <SmallButton
                onPress={handleBackToJobBoard}
                className="bg-white border-hairline mt-5"
                title="Back to Job Board"
                textClass="!text-primary"
              />
            </SafeAreaView>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default JobApplyModal;
