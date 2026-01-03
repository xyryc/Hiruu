import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

const EditBadgeModal = ({ visible, onClose }: any) => {
  const [selectedCards, setSelectedCards] = React.useState<number[]>([]);

  const badchcard = [
    {
      img: require("@/assets/images/reward/red-bands.svg"),
      bgColor: "#F3934F26",
      color: "#F3934F",
      title: "Hard worker",
    },
    {
      img: require("@/assets/images/reward/black-bands.svg"),
      bgColor: "#80808026",
      color: "#808080",
      title: "Night Owl",
    },
    {
      img: require("@/assets/images/reward/gold-bands.svg"),
      bgColor: "#F1C40026",
      color: "#F1C400",
      title: "Early Bird",
    },
    {
      img: require("@/assets/images/reward/blue-bands.svg"),
      bgColor: "#4FB2F326",
      color: "#4FB2F3",
      title: "Hard worker",
    },
  ];

  const handleCardSelect = (index: number) => {
    setSelectedCards((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length < 3) return [...prev, index];
      return prev;
    });
  };

  const getSelectionNumber = (index: number) => {
    const position = selectedCards.indexOf(index);
    return position !== -1 ? position + 1 : null;
  };

  const renderBadgeRow = (rowOffset: number) => (
    <View className="flex-row justify-between mt-4">
      {badchcard.map((item, idx) => {
        const cardIndex = idx + rowOffset;
        const selectionNumber = getSelectionNumber(cardIndex);
        const isSelected = selectionNumber !== null;

        return (
          <TouchableOpacity
            key={cardIndex}
            onPress={() => handleCardSelect(cardIndex)}
            className="items-center"
          >
            <View
              className="h-[74px] w-[54px] border-2 rounded-xl justify-center items-center"
              style={{ backgroundColor: item.bgColor, borderColor: item.color }}
            >
              <Image
                source={item.img}
                contentFit="contain"
                style={{ height: 42, width: 29 }}
              />
              {isSelected && (
                <View
                  className="absolute -top-1 -right-1 rounded-full h-5 w-5 items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-white font-proximanova-bold text-xs">
                    {selectionNumber}
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-proximanova-regular text-xs text-primary dark:text-dark-primary mt-2">
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-8 py-7">
            <Text className="font-proximanova-bold text-xl mb-7 text-primary dark:text-dark-primary text-center">
              Select Your Badge
            </Text>

            {renderBadgeRow(0)}
            {renderBadgeRow(4)}
            {renderBadgeRow(8)}
            <PrimaryButton title="Save" className="mt-10" />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default EditBadgeModal;
