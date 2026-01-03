import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Interest {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface InterestsSelectionProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
}

const InterestsSelection: React.FC<InterestsSelectionProps> = ({
  selectedInterests,
  onInterestsChange,
  maxSelections = 10,
}) => {
  const interests: Interest[] = [
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
    { id: "cooking", name: "Cooking", icon: "🔍", color: "bg-orange-200" },
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

  const toggleInterest = (interestId: string) => {
    const isSelected = selectedInterests.includes(interestId);

    if (isSelected) {
      // Remove interest
      onInterestsChange(selectedInterests.filter((id) => id !== interestId));
    } else {
      // Add interest (if not at max limit)
      if (selectedInterests.length < maxSelections) {
        onInterestsChange([...selectedInterests, interestId]);
      }
    }
  };

  const isSelected = (interestId: string) =>
    selectedInterests.includes(interestId);

  return (
    <View>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-xl font-proximanova-semibold text-gray-900 mb-2">
          What are your interests?
        </Text>
        <Text className="text-sm text-gray-600">
          Select up to {maxSelections} interests ({selectedInterests.length}/
          {maxSelections} selected)
        </Text>
      </View>

      {/* Interests Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
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

      {/* Selected Count */}
      {selectedInterests.length >= maxSelections && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-blue-700 text-sm text-center">
            Maximum selections reached. Deselect an interest to choose another.
          </Text>
        </View>
      )}
    </View>
  );
};

export default InterestsSelection;
