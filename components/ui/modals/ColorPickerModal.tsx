import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ColorPicker, { HueSlider, Panel1 } from "reanimated-color-picker";
import PrimaryButton from "../buttons/PrimaryButton";

interface ColorPickerModalProps {
  pickerType: string;
  setPickerType: React.Dispatch<React.SetStateAction<"solid" | "gradient">>;
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string | string[]) => void;
  initialColor?: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  pickerType,
  setPickerType,
  visible,
  onClose,
  onSelectColor,
  initialColor = "#6366F1",
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [gradientColors, setGradientColors] = useState(["#6366F1", "#EC4899"]);
  const [activeGradientIndex, setActiveGradientIndex] = useState(0);

  // Saved solid colors
  const savedColors = [
    "#6366F1",
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#14B8A6",
    "#3B82F6",
    "#EC4899",
    "#F43F5E",
    "#A855F7",
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#84CC16",
  ];

  // Recent gradients
  const recentGradients = [
    ["#6366F1", "#EC4899"],
    ["#EF4444", "#F97316"],
    ["#F97316", "#EAB308"],
    ["#EAB308", "#22C55E"],
  ];

  const handlePreview = () => {
    if (pickerType === "solid") {
      onSelectColor(selectedColor);
    } else {
      onSelectColor(gradientColors);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Ionicons name="close-outline" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View className="mb-7">
            <Text className="text-xl text-center font-proximanova-bold text-primary dark:text-dark-primary">
              Change Profile color
            </Text>
          </View>

          {/* picker container */}
          <View className="border border-[#EEEEEE] p-4 rounded-lg">
            {/* Type Selector */}
            <View className="mb-4 flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setPickerType("solid")}
                className={`px-4 py-2.5 rounded-full ${
                  pickerType === "solid"
                    ? "bg-[#11293A]"
                    : "bg-transparent border border-[#EEEEEE]"
                }`}
              >
                <Text
                  className={`text-center font-proximanova-semibold ${
                    pickerType === "solid" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Solid
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPickerType("gradient")}
                className={`px-4 py-2.5 rounded-full ${
                  pickerType === "gradient"
                    ? "bg-[#11293A]"
                    : "bg-transparent border border-[#EEEEEE]"
                }`}
              >
                <Text
                  className={`text-center font-proximanova-semibold ${
                    pickerType === "gradient" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Gradient
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Color Picker */}
              <ColorPicker
                value={
                  pickerType === "solid"
                    ? selectedColor
                    : gradientColors[activeGradientIndex]
                }
                onChangeJS={({ hex }) => {
                  if (pickerType === "solid") {
                    setSelectedColor(hex);
                  } else {
                    // Create copy of array, update specific index, save state
                    const newColors = [...gradientColors];
                    newColors[activeGradientIndex] = hex;
                    setGradientColors(newColors);
                  }
                }}
                style={{ width: "100%" }}
              >
                <Panel1
                  style={{ borderRadius: 16, height: 100, marginBottom: 20 }}
                />
                <HueSlider style={{ borderRadius: 20, height: 40 }} />
              </ColorPicker>

              {/* Gradient Color Buttons */}
              {pickerType === "gradient" && (
                <View className="flex-row gap-3 mb-4 mt-4">
                  {gradientColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setActiveGradientIndex(index)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        activeGradientIndex === index
                          ? "border-gray-500"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </View>
              )}

              {/* Saved Colors or Recent Gradients */}
              {pickerType === "solid" ? (
                <View className="mt-4">
                  <Text className="text-xs font-proximanova-medium text-secondary dark:text-dark-secondary mb-2.5">
                    Saved colors:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {savedColors.map((color, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color
                            ? "border-gray-500"
                            : "border-white"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View className="mt-4">
                  <Text className="text-xs font-proximanova-medium text-secondary dark:text-dark-secondary mb-2.5">
                    Recent Gradient:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {recentGradients.map((gradient, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setGradientColors(gradient)}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden"
                      >
                        <LinearGradient
                          //@ts-ignore
                          colors={gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ flex: 1 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Preview Button */}
          <PrimaryButton
            className="mt-4"
            title="Preview"
            onPress={handlePreview}
          />
        </View>
      </BlurView>
    </Modal>
  );
};

export default ColorPickerModal;
