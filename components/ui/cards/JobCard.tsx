import { JobCardProps } from "@/types";
import {
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import SmallButton from "../buttons/SmallButton";
import JobApplyModal from "../modals/JobApplyModal";
import OwnerJobActionsModal from "../modals/OwnerJobActionsModal";

const getAddressLabel = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "-";

  const addr = value as { address?: unknown };
  return typeof addr.address === "string" && addr.address.trim().length > 0
    ? addr.address.trim()
    : "-";
};

const MarqueeText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const shouldAnimate = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!shouldAnimate) {
      translateX.setValue(0);
      return;
    }

    const travel = textWidth - containerWidth + 16;
    const duration = Math.max(2200, travel * 35);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(translateX, {
          toValue: -travel,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(350),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [containerWidth, shouldAnimate, textWidth, translateX]);

  return (
    <View
      className="overflow-hidden"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Measure natural text width so autoplay starts reliably when overflowing */}
      <Text
        className={className}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        style={{ position: "absolute", opacity: 0 }}
      >
        {text}
      </Text>
      <Animated.Text
        numberOfLines={1}
        style={{ transform: [{ translateX }] }}
        className={className}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

const JobCard = ({
  className,
  compact = false,
  hideApplyButton = false,
  showOwnerMenu = false,
  onPressOwnerEdit,
  job,
}: JobCardProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showOwnerMenuModal, setShowOwnerMenuModal] = useState(false);

  const salarySuffix = useMemo(
    () => (job?.salaryType === "monthly" ? "/mo" : "/hr"),
    [job?.salaryType]
  );
  const roleName = job?.role?.role?.name || job?.name || "-";
  const hasSalary =
    typeof job?.salaryMin === "number" && typeof job?.salaryMax === "number";
  const isFeatured = Boolean(job?.isFeatured);
  const isPlainSurface = !isFeatured;
  const isPremiumBusiness = Boolean(job?.business?.isPremium);
  const metaBadgeLabel = isFeatured ? "Featured" : "Standard";
  const shareCount =
    typeof job?.shareCount === "number" ? job.shareCount : 0;
  const distanceValue = job?.distanceKm || null;
  const distanceLabel = Number.isFinite(distanceValue)
    ? `${distanceValue} Km Away`
    : null;
  const formatLabel = (value?: string) =>
    (value || "-")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const typeLabel =
    job?.jobType || job?.shiftType
      ? `${formatLabel(job?.jobType)}${job?.shiftType ? ` • ${formatLabel(job?.shiftType)}` : ""}`
      : formatLabel(job?.salaryType);
  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 2,
      }),
    []
  );
  const formatCompactNumber = (value: number) => compactFormatter.format(value);
  const salaryLabel = hasSalary
    ? `${formatCompactNumber(job?.salaryMin as number)}-${formatCompactNumber(
      job?.salaryMax as number
    )}$${salarySuffix}`
    : "-";
  const addressLabel = getAddressLabel(job?.business?.address?.city);

  return (
    <View
      className={`${className} p-4 rounded-xl`}
      style={{ backgroundColor: isFeatured ? "#E5F4FD" : "#FFFFFF" }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <TouchableOpacity
          onPress={() => {
            const businessId = job?.businessId || job?.business?.id;
            const recruitmentId = job?.id;

            if (businessId && recruitmentId) {
              router.push({
                pathname: "/screens/jobs/user/profile",
                params: { businessId, recruitmentId },
              });
              return;
            }

            router.push("/screens/jobs/user/profile");
          }}
          className="flex-1 flex-row gap-2.5"
        >
          <Image
            source={
              job?.business?.logo ||
              require("@/assets/images/placeholder.png")
            }
            style={{ width: 40, height: 40, borderRadius: 999 }}
            contentFit="cover"
          />

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-proximanova-semibold text-primary dark:text-dark-primary mb-1"
            >
              {roleName}{" "}
              {isFeatured ? (
                <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
              ) : null}
            </Text>
            <Text
              numberOfLines={1}
              className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary"
            >
              {job?.business?.name || "-"}
            </Text>
          </View>
        </TouchableOpacity>

        {showOwnerMenu ? (
          <TouchableOpacity
            onPress={() => setShowOwnerMenuModal(true)}
            className="rounded-full p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Entypo name="dots-three-vertical" size={16} color="black" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-1.5 pr-2">
          <SimpleLineIcons name="location-pin" size={12} color="black" />
          <Text
            numberOfLines={1}
            className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary"
          >
            {addressLabel}
          </Text>
        </View>

        <View style={{ width: 132 }}>
          <MarqueeText
            text={salaryLabel}
            className="text-xl font-proximanova-semibold text-primary text-right"
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-1.5 mt-2.5">
        <View
          className="flex-row gap-1.5 items-center px-2.5 py-1 rounded-full"
          style={{
            backgroundColor:
              compact || isPlainSurface ? "#3F98FF4D" : "#FFFFFF",
          }}
        >
          <MaterialIcons name="verified" size={16} color="#3090FF" />
          <Text className="text-xs font-proximanova-regular text-primary">
            {isPremiumBusiness ? "Premium" : "Business"}
          </Text>
        </View>

        <View
          className="flex-row gap-1.5 items-center px-2.5 py-1 rounded-full"
          style={{
            backgroundColor:
              compact || isPlainSurface ? "#F5F5F5" : "#FFFFFF",
          }}
        >
          <FontAwesome name="star" size={16} color="#F1C400" />
          <Text className="text-xs font-proximanova-regular">{metaBadgeLabel}</Text>
        </View>

        <View
          className="flex-row gap-1.5 items-center px-2.5 py-1 rounded-full"
          style={{
            backgroundColor:
              compact || isPlainSurface ? "#F5F5F5" : "#FFFFFF",
          }}
        >
          <Text className="text-xs font-proximanova-regular">
            {typeLabel}
          </Text>
        </View>

        {distanceLabel ? (
          <View
            className="flex-row gap-1.5 items-center px-2.5 py-1 rounded-full"
            style={{
              backgroundColor:
                compact || isPlainSurface ? "#F5F5F5" : "#FFFFFF",
            }}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-xs font-proximanova-regular text-primary"
            >
              {distanceLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {!compact && (
        <>
          <Image
            source={require("@/assets/images/dotted-line.svg")}
            style={{ height: 1, width: "100%", marginVertical: 10 }}
            contentFit="contain"
          />

          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-1 items-center">
              <MaterialCommunityIcons
                name="note-text-outline"
                size={18}
                color="#7A7A7A"
              />
              <Text className="text-sm font-proximanova-regular text-secondary">
                {job?._count?.recruitmentApplications ?? 0}
              </Text>
            </View>

            <Image
              source={require("@/assets/images/line-small.svg")}
              style={{ width: 1, height: 18 }}
            />

            <View className="flex-row gap-1 items-center">
              <SimpleLineIcons name="share-alt" size={14} color="#7A7A7A" />
              <Text className="text-sm font-proximanova-regular text-secondary">
                {shareCount}
              </Text>
            </View>

            <Image
              source={require("@/assets/images/line-small.svg")}
              style={{ width: 1, height: 18 }}
            />

            {!hideApplyButton ? (
              <SmallButton
                className="w-28"
                title="Apply Now"
                onPress={() => setShowModal(true)}
              />
            ) : null}
          </View>
        </>
      )}

      {!hideApplyButton ? (
        <JobApplyModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          job={job}
        />
      ) : null}

      <OwnerJobActionsModal
        visible={showOwnerMenu && showOwnerMenuModal}
        onClose={() => setShowOwnerMenuModal(false)}
        onEdit={() => {
          setShowOwnerMenuModal(false);
          onPressOwnerEdit?.();
        }}
      />
    </View>
  );
};

export default JobCard;
