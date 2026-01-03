import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";

const RegularShiftCard = ({ shift }) => {
  return (
    <View>
      <Text className="font-proximanova-bold text-primary dark:text-dark-primary mb-3">
        {shift.title}
      </Text>

      <View className="flex-row justify-between">
        <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
          Time:
        </Text>
        <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary">
          {shift.workTime}
        </Text>
      </View>

      <View>
        {shift.breakTime && (
          <View className="flex-row justify-between">
            <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              Break:
            </Text>
            <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary">
              {shift.breakTime}
            </Text>
          </View>
        )}
      </View>

      <View>
        {shift.location && (
          <View className="flex-row justify-between">
            <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              Location:
            </Text>
            <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary">
              {shift.location}
            </Text>
          </View>
        )}
      </View>

      <View className="py-3 w-full">
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          style={{
            width: "100%",
            height: 1,
          }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Image
            source="https://cdn.textstudio.com/output/studio/template/preview/stamped/g/4/c/7/z7a7c4g.webp"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
            }}
          />

          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {shift.company}
          </Text>
        </View>

        <View className="flex-row gap-1.5 items-center">
          <StatusBadge status={shift.status} />
          <TouchableOpacity
            className={`p-2 rounded-full
              ${shift.status === "ongoing" || shift.status === "upcoming" ? "bg-[#4FB2F3]" : "bg-[#4fb1f365]"}`}
          >
            <Feather name="repeat" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegularShiftCard;
