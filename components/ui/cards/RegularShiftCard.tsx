import { StatusBadgeProps, UserScheduleUiShift } from "@/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";

type RegularShiftCardProps = {
  shift: UserScheduleUiShift;
};

const RegularShiftCard = ({ shift }: RegularShiftCardProps) => {
  const badgeStatus: StatusBadgeProps["status"] =
    shift.status === "no_shift" ? "upcoming" : shift.status;

  const handleBusinessLogoPress = () => {
    if (!shift?.businessId) return;

    router.push({
      pathname: "/screens/profile/business/public-business-profile",
      params: { businessId: shift.businessId },
    });
  };

  return (
    <View>
      <Text className="font-proximanova-bold text-primary dark:text-dark-primary mb-3">
        {shift.title}
      </Text>

      <View className="flex-row justify-between">
        <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
          Time:
        </Text>
        <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary uppercase">
          {shift.workTime}{" "}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
          Break:
        </Text>
        <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary">
          {shift.breakTime || "--:--"}
        </Text>
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
          <TouchableOpacity onPress={handleBusinessLogoPress}>
            <Image
              source={
                shift.companyLogo
                  ? { uri: shift.companyLogo }
                  : require("@/assets/images/placeholder.png")
              }
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
              }}
              contentFit="cover"
            />
          </TouchableOpacity>

          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {shift.company}
          </Text>
        </View>

        <View className="flex-row gap-1.5 items-center">
          <StatusBadge status={badgeStatus} />
          {/* <TouchableOpacity
            className={`p-2 rounded-full
              ${shift.status === "ongoing" || shift.status === "upcoming" ? "bg-[#4FB2F3]" : "bg-[#4fb1f365]"}`}
          >
            <Feather name="repeat" size={14} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default RegularShiftCard;
