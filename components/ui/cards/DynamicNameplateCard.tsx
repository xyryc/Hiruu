import { NameplateMetadataV2, SizeValue } from "@/stores/rewardStore";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  DimensionValue,
  ImageStyle as RNImageStyle,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";

type DynamicNameplatePreview = {
  availabilityLabel?: string;
  remainingTime?: string;
  avatarUrl?: string | null;
  name?: string;
  location?: string;
  rating?: number | string;
  isVerified?: boolean;
  coins?: string | number;
  locked?: boolean;
  isOwnedActive?: boolean;
  isEquipped?: boolean;
  expiresAt?: string | null;
};

type DynamicNameplateCardProps = {
  metadata?: NameplateMetadataV2 | null;
  className?: string;
  style?: StyleProp<ViewStyle>;
  mode?: "shop" | "redeem";
  preview?: DynamicNameplatePreview;
};

const toStyleSize = (value?: SizeValue | null): DimensionValue | undefined => {
  // API sends mixed size values (number or string), RN style accepts both.
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "auto") return "auto";
    if (trimmed.endsWith("%")) {
      return trimmed as `${number}%`;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const DynamicNameplateCard = ({
  metadata,
  className,
  style,
  mode = "shop",
  preview,
}: DynamicNameplateCardProps) => {
  const previewRating = Number(preview?.rating);
  const previewRatingLabel =
    Number.isFinite(previewRating) && previewRating > 0
      ? `${previewRating.toFixed(1)}/5`
      : "N/A";

  const border = metadata?.border;
  const background = metadata?.background;
  const icon = metadata?.element?.icon;
  const overlays = Array.isArray(metadata?.element?.overlays)
    ? metadata?.element?.overlays
    : [];

  const borderRadius = border?.radius ?? 12;
  const accentColor = border?.color || "#4FB2F3";

  // Border width comes from API per side, so we map each side explicitly.
  const rootStyle: ViewStyle = {
    borderRadius,
    borderColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    overflow: "hidden",
    minHeight: 120,
  };
  const borderOverlayStyle: ViewStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius,
    borderColor: border?.color || "transparent",
    borderTopWidth: border?.width?.top ?? 0,
    borderLeftWidth: border?.width?.left ?? 0,
    borderRightWidth: border?.width?.right ?? 0,
    borderBottomWidth: border?.width?.bottom ?? 0,
    borderStyle: border?.style || "solid",
    zIndex: 999,
    pointerEvents: "none",
  };

  const gradientColorList = background?.gradient?.colors;
  const gradientColors =
    gradientColorList && gradientColorList.length >= 2
      ? ([
        gradientColorList[0],
        gradientColorList[1],
        ...gradientColorList.slice(2),
      ] as [string, string, ...string[]])
      : null;

  const content = (
    <View className={`min-h-[120px] ${className || ""}`} style={style}>
      {/* Optional image background layer */}
      {background?.type === "image" && background?.image?.url ? (
        <Image
          source={background.image.url}
          contentFit={background.image.repeat === "repeat" ? "cover" : "contain"}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity:
              typeof background.image.opacity === "number"
                ? background.image.opacity
                : 1,
          }}
        />
      ) : null}

      {/* Overlay layer(s), usually decorative assets from metadata */}
      {overlays.map((overlay, index) => {
        const overlayStyle: RNImageStyle = {
          position: "absolute",
          top: toStyleSize(overlay?.position?.top),
          right: toStyleSize(overlay?.position?.right),
          bottom: toStyleSize(overlay?.position?.bottom),
          left: toStyleSize(overlay?.position?.left),
          width: toStyleSize(overlay?.size?.width),
          height: toStyleSize(overlay?.size?.height),
          opacity: typeof overlay?.opacity === "number" ? overlay.opacity : 0.15,
          zIndex: overlay?.zIndex,
          backgroundColor:
            overlay?.type === "shape" && overlay?.color ? overlay.color : undefined,
        };

        if (overlay?.url) {
          return (
            <Image
              key={`${overlay?.url}-${index}`}
              source={overlay.url}
              contentFit="fill"
              style={overlayStyle}
            />
          );
        }

        return <View key={`shape-${index}`} style={overlayStyle as ViewStyle} />;
      })}

      {/* Main icon layer, positioned by metadata */}
      {icon?.url ? (
        <Image
          source={icon.url}
          contentFit="contain"
          style={{
            position: "absolute",
            top: toStyleSize(icon?.position?.top),
            right: toStyleSize(icon?.position?.right),
            bottom: toStyleSize(icon?.position?.bottom),
            left: toStyleSize(icon?.position?.left),
            width: toStyleSize(icon?.size?.width),
            height: toStyleSize(icon?.size?.height),
            opacity: typeof icon?.opacity === "number" ? icon.opacity : 1,
            zIndex: icon?.zIndex,
          }}
        />
      ) : null}

      {mode === "shop" ? (
        <>
          {/* Top timer */}
          <View className="absolute top-0 inset-x-0 items-center z-30">
            <Image
              source={require("@/assets/images/timer-bg.svg")}
              style={{
                width: 227,
                height: 34,
              }}
              contentFit="contain"
            />

            <View className="absolute top-0 inset-x-0 items-center">
              <View className="flex-row items-center gap-1.5 py-2">
                <Text className="text-sm font-proximanova-regular">
                  {preview?.availabilityLabel || "Available for"}
                </Text>

                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="timer-sand"
                    size={16}
                    color={accentColor}
                  />
                  <Text className="font-proximanova-bold" style={{ color: accentColor }}>
                    {preview?.remainingTime || "1d, 10h"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="px-4 pb-4 pt-11 flex-row items-center gap-2 rounded-2xl z-20">
            {/* Profile image */}
            <Image
              source={require("@/assets/images/user.svg")}
              style={{
                width: 50,
                height: 50,
                borderRadius: 999,
                marginRight: 10,
              }}
              contentFit="cover"
            />

            {/* Profile details */}
            <View className="flex-1 relative">
              <View className="h-3.5 w-36 rounded-[30px]" style={{ backgroundColor: accentColor }} />

              <View className="absolute right-0 bottom-0 flex-row">
                {preview?.isOwnedActive ? (
                  <View
                    className="rounded-full px-2.5 py-1 bg-white"
                  >
                    <Text
                      className={`text-xs font-proximanova-semibold ${preview?.isEquipped ? "text-[#2D6EEA]" : "text-[#2E9B50]"
                        }`}
                    >
                      {preview?.isEquipped ? "Equipped" : "Owned"}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row gap-1.5 items-center">
                    {preview?.locked === false ? null : (
                      <MaterialIcons
                        className="bg-white/40 p-1.5 rounded-full"
                        name="lock"
                        size={14}
                        color="black"
                      />
                    )}
                    <View className="flex-row items-center">
                      <Image
                        source={require("@/assets/images/hiruu-coin.svg")}
                        style={{
                          width: 24,
                          height: 24,
                          zIndex: 20,
                        }}
                        contentFit="contain"
                      />
                      <View className="px-5 py-1 bg-white -ml-4 z-10 rounded-r-[40px]">
                        <Text className="text-xs font-proximanova-semibold">
                          {preview?.coins ?? "05"}5
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </>
      ) : (
        <View className="absolute inset-0 px-4 flex-row items-center rounded-2xl z-20">
          <View className='rounded-full mr-2.5 p-1'
            style={{
              borderColor: border?.color || "transparent",
              borderWidth: 2,
              borderRadius: 999
            }}
          >
            <Image
              source={
                preview?.avatarUrl
                  ? { uri: preview.avatarUrl }
                  : require("@/assets/images/user.svg")
              }
              style={{
                width: 78,
                height: 78,
                borderRadius: 999,

              }}
              contentFit="cover"
            />
          </View>

          <View className="max-w-[70%] items-start">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Text
                numberOfLines={1}
                className="font-proximanova-semibold text-sm text-primary"
              >
                {preview?.name || "User"}
              </Text>

              {preview?.isVerified === false ? null : (
                <MaterialIcons name="verified" size={16} color="#4F83F3" />
              )}
            </View>

            <View className="flex-row gap-1 mb-1.5">
              <SimpleLineIcons name="location-pin" size={12} color="black" />

              <Text numberOfLines={2}
                className="font-proximanova-regular text-xs text-primary">
                {preview?.location || "Location unavailable"}
              </Text>
            </View>

            <View className="flex-row gap-1 px-2 py-1 bg-white/40 rounded-md">
              <Octicons name="star-fill" size={12} color="#F1C400" />
              <Text className="font-proximanova-semibold text-xs text-primary">
                {previewRatingLabel}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={rootStyle}>
      {/* Background layer: gradient when provided, otherwise plain color/transparent */}
      {background?.type === "gradient" && gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          style={{ borderRadius, overflow: "hidden" }}
          start={
            background?.gradient?.start
              ? {
                x: background.gradient.start.x,
                y: background.gradient.start.y,
              }
              : { x: 0, y: 0 }
          }
          end={
            background?.gradient?.end
              ? {
                x: background.gradient.end.x,
                y: background.gradient.end.y,
              }
              : { x: 1, y: 1 }
          }
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={{
            borderRadius,
            overflow: "hidden",
            backgroundColor:
              background?.type === "color" ? background.color || "transparent" : "transparent",
          }}
        >
          {content}
        </View>
      )}
      <View style={borderOverlayStyle} />
    </View>
  );
};

export default DynamicNameplateCard;
