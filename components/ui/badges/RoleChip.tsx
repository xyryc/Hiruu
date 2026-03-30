import React from "react";
import { Text, View } from "react-native";

type RoleChipProps = {
  name: string;
  count: number;
  bg?: string;
  color?: string;
  className?: string;
};

export type RoleChipItem = {
  name: string;
  count: number;
  bg?: string;
  color?: string;
};

export const DEFAULT_ROLE_CHIPS: RoleChipItem[] = [
  { name: "Cashier ", count: 2, bg: "#E8EDF8", color: "#B8C8E9" },
  { name: "Bartender", count: 1, bg: "#F1EDDF", color: "#D2A80F" },
  { name: "Cleaner", count: 1, bg: "#DCECE1", color: "#32AE53" },
  { name: "Security", count: 1, bg: "#F9E8EA", color: "#DC4B6E" },
  { name: "Waiter", count: 3, bg: "#E3F1F8", color: "#2D9ED8" },
  { name: "Chef", count: 1, bg: "#EFE7F8", color: "#8B5CF6" },
];

const ROLE_CHIP_COLOR_PALETTE = [
  { bg: "#E8EDF8", color: "#8EA8D8" },
  { bg: "#F1EDDF", color: "#C99700" },
  { bg: "#DCECE1", color: "#2E9B49" },
  { bg: "#F9E8EA", color: "#D83F67" },
  { bg: "#E3F1F8", color: "#268EC2" },
  { bg: "#EFE7F8", color: "#7A4FD1" },
  { bg: "#FDECCF", color: "#C77700" },
  { bg: "#E7F8EF", color: "#19995A" },
];

const getStablePaletteIndex = (seed: string, length: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
};

const RoleChip = ({
  name,
  count,
  bg,
  color,
  className,
}: RoleChipProps) => {
  const randomColorPair =
    ROLE_CHIP_COLOR_PALETTE[
    getStablePaletteIndex(name, ROLE_CHIP_COLOR_PALETTE.length)
    ];
  const chipBg = bg || randomColorPair.bg;
  const chipTextColor = color || randomColorPair.color;

  return (
    <View
      className={`px-2 py-1.5 rounded-full ${className || ""}`}
      style={{ backgroundColor: chipBg }}
    >
      <Text className="font-proximanova-semibold text-sm" style={{ color: chipTextColor }}>
        {name}: {count}
      </Text>
    </View>
  );
};

export default RoleChip;
