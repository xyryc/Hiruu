import { NameplateMetadataV2, SizeValue } from "@/stores/rewardStore";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type DynamicNameplateCardProps = {
  metadata?: NameplateMetadataV2 | null;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const toStyleSize = (value?: SizeValue | null) => {
  // API sends mixed size values (number or string), RN style accepts both.
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  return undefined;
};

const DynamicNameplateCard = ({
  metadata,
  className,
  style,
}: DynamicNameplateCardProps) => {
  const border = metadata?.border;
  const background = metadata?.background;
  const icon = metadata?.element?.icon;
  const overlays = Array.isArray(metadata?.element?.overlays)
    ? metadata?.element?.overlays
    : [];

  const borderRadius = border?.radius ?? 12;

  // Border width comes from API per side, so we map each side explicitly.
  const rootStyle: ViewStyle = {
    borderRadius,
    borderColor: border?.color || "transparent",
    borderTopWidth: border?.width?.top ?? 0,
    borderLeftWidth: border?.width?.left ?? 0,
    borderRightWidth: border?.width?.right ?? 0,
    borderBottomWidth: border?.width?.bottom ?? 0,
    borderStyle: border?.style || "solid",
    overflow: "hidden",
    minHeight: 120,
  };

  const gradientColors = background?.gradient?.colors || [];

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
        const overlayStyle: ViewStyle = {
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

        return <View key={`shape-${index}`} style={overlayStyle} />;
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
    </View>
  );

  return (
    <View style={rootStyle}>
      {/* Background layer: gradient when provided, otherwise plain color/transparent */}
      {background?.type === "gradient" && gradientColors.length > 0 ? (
        <LinearGradient
          colors={gradientColors}
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
            backgroundColor:
              background?.type === "color" ? background.color || "transparent" : "transparent",
          }}
        >
          {content}
        </View>
      )}
    </View>
  );
};

export default DynamicNameplateCard;
