import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const ExperienceLevel = ({ titleHeight }: any) => {
  const [experiences, setExperiences] = useState([
    { id: 1, role: "Cashier", value: 5 },
    { id: 2, role: "Receptionist", value: 5 },
  ]);

  const updateExperience = (id: number, increment: boolean) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              value: increment ? exp.value + 1 : Math.max(0, exp.value - 1),
            }
          : exp
      )
    );
  };

  const addNewExperience = () => {
    const newId = Math.max(...experiences.map((exp) => exp.id)) + 1;
    setExperiences([...experiences, { id: newId, role: "New Role", value: 0 }]);
  };

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <View className="py-5">
      {titleHeight || (
        <Text className="text-base font-proximanova-semibold text-primary mb-4">
          Experience Level
        </Text>
      )}

      {experiences.map((exp) => (
        <View key={exp.id} className="flex-row items-center mb-3 gap-3">
          {/* Role Input */}
          <View className="flex-1">
            {/* <Text className="font-proximanova-regular text-gray-600">
              {exp.role}
            </Text> */}
            <TextInput
              placeholder={exp?.role}
              value={exp?.role}
              className="border border-[#EEEEEE] px-2.5 py-2.5 rounded-lg font-proximanova-regular text-sm"
              // keyboardType="twitter"
              autoCapitalize="none"
            />
          </View>

          {/* Value Display */}
          <View className="border border-[#EEEEEE] flex-row justify-between items-center gap-6 px-2 py-3 rounded-xl">
            <View>
              <Text className="font-proximanova-semibold text-primary">
                {exp.value.toString().padStart(2, "0")}
              </Text>
            </View>

            <View className="flex-row justify-center items-center">
              {/* Plus Button */}
              <TouchableOpacity onPress={() => updateExperience(exp.id, true)}>
                <Feather name="plus" size={16} color="#7A7A7A" />
              </TouchableOpacity>

              {/* Minus Button */}
              <TouchableOpacity onPress={() => updateExperience(exp.id, false)}>
                <Feather name="minus" size={16} color="#7A7A7A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add/Remove Circle Button */}
          <TouchableOpacity
            onPress={() =>
              exp.id === experiences[experiences.length - 1].id
                ? addNewExperience()
                : removeExperience(exp.id)
            }
            className={`items-center justify-center ${
              exp.id === experiences[experiences.length - 1].id
            }`}
          >
            <Feather
              name={
                exp.id === experiences[experiences.length - 1].id
                  ? "plus-circle"
                  : "minus-circle"
              }
              size={24}
              color={
                exp.id === experiences[experiences.length - 1].id
                  ? "#4FB2F3"
                  : "#F87171"
              }
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default ExperienceLevel;
