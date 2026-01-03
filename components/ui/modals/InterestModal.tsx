import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

interface InterestModalProps {
  visible: boolean;
  /** initial selected interest ids when the modal opens */
  initialInterests?: string[];
  /** called whenever the selection changes */
  onChange?: (selected: string[]) => void;
  /** called when the modal closes; receives the final selection */
  onClose: (selected: string[]) => void;
}

const InterestModal = ({
  visible,
  initialInterests,
  onChange,
  onClose,
}: InterestModalProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialInterests ?? []
  );

  const interests = [
    { id: "art", name: "Art", icon: "🎨", color: "bg-orange-100" },
    { id: "traveling", name: "Traveling", icon: "✈️", color: "bg-blue-100" },
    {
      id: "photography",
      name: "Photography",
      icon: "📷",
      color: "bg-yellow-100",
    },
    { id: "music", name: "Music", icon: "🎵", color: "bg-green-100" },
    {
      id: "social-media",
      name: "Social Media",
      icon: "📱",
      color: "bg-gray-100",
    },
    { id: "sports", name: "Sports", icon: "⚽", color: "bg-gray-200" },
    { id: "reading", name: "Reading", icon: "📚", color: "bg-green-200" },
    { id: "poetry", name: "Poetry", icon: "📄", color: "bg-yellow-200" },
    { id: "drawing", name: "Drawing", icon: "✏️", color: "bg-pink-100" },
    { id: "climbing", name: "Climbing", icon: "🧗", color: "bg-brown-100" },
    { id: "cooking", name: "Cooking", icon: "🍳", color: "bg-orange-200" },
    { id: "nature", name: "Nature", icon: "🌳", color: "bg-green-300" },
    { id: "painting", name: "Painting", icon: "🖌️", color: "bg-blue-200" },
    { id: "acting", name: "Acting", icon: "🎭", color: "bg-cyan-100" },
    { id: "podcasts", name: "Podcasts", icon: "📋", color: "bg-gray-300" },
    { id: "shopping", name: "Shopping", icon: "🛍️", color: "bg-pink-200" },
    { id: "writing", name: "Writing", icon: "✍️", color: "bg-gray-400" },
    { id: "self-care", name: "Self-care", icon: "🐱", color: "bg-yellow-300" },
    { id: "design", name: "Design", icon: "🎨", color: "bg-orange-300" },
    { id: "singing", name: "Singing", icon: "🎤", color: "bg-purple-100" },
    {
      id: "architecture",
      name: "Architecture",
      icon: "🏛️",
      color: "bg-gray-500",
    },
    { id: "tattoo", name: "Tattoo", icon: "🐍", color: "bg-green-400" },
    { id: "crochet", name: "Crochet", icon: "🧶", color: "bg-red-100" },
    { id: "lifestyles", name: "Lifestyles", icon: "🍄", color: "bg-pink-300" },
  ];

  const maxSelections = 8;
  const toggleInterest = (interestId: string) => {
    const isSelected = selectedInterests.includes(interestId);

    let newSelected: string[];
    if (isSelected) {
      // Remove interest
      newSelected = selectedInterests.filter((id) => id !== interestId);
    } else {
      // Add interest (if not at max limit)
      if (selectedInterests.length < maxSelections) {
        newSelected = [...selectedInterests, interestId];
      } else {
        // At max limit, ignore the add
        newSelected = selectedInterests;
      }
    }

    setSelectedInterests(newSelected);
    // Notify parent of intermediate changes if provided
    if (onChange) onChange(newSelected);
  };

  const isSelected = (interestId: string) =>
    selectedInterests.includes(interestId);

  const handleDone = () => {
    // Pass final selection back to parent before closing
    if (onClose) onClose(selectedInterests);
  };

  // Note: we initialize selectedInterests from the optional `initialInterests`
  // prop via the useState initializer above. If you need the modal to reset
  // whenever it opens, we can reintroduce a useEffect to watch `visible`.

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl  max-h-[75%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary text-center">
              Change Your Interest{" "}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 80,
              }}
            >
              <View className="flex-row flex-wrap justify-between mt-10">
                {interests.map((interest) => {
                  const selected = isSelected(interest.id);

                  return (
                    <TouchableOpacity
                      key={interest.id}
                      onPress={() => toggleInterest(interest.id)}
                      className="w-[23%] mb-4"
                      activeOpacity={0.7}
                    >
                      <View className="items-center">
                        {/* Icon Circle */}
                        <View className="relative">
                          <View
                            className={`w-16 h-16 rounded-full items-center justify-center
                        ${selected && `border border-primary`}
                        ${interest.color}`}
                          >
                            <Text className="text-2xl">{interest.icon}</Text>
                          </View>

                          {/* Checkmark */}
                          {selected && (
                            <View className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 rounded-full items-center justify-center border-2 border-white">
                              <Text className="text-white text-xs font-proximanova-bold">
                                ✓
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Label */}
                        <Text
                          className={`text-xs text-center mt-2 font-proximanova-medium ${
                            selected ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {interest.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* warning */}
            <View className="absolute bottom-10 inset-x-0 items-center mx-5">
              {selectedInterests.length >= maxSelections && (
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="text-blue-700 text-sm text-center">
                    Maximum selections reached. Deselect an interest to choose
                    another.
                  </Text>
                </View>
              )}
              <PrimaryButton
                title="Save"
                className="mt-2.5"
                onPress={handleDone}
              />
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default InterestModal;
