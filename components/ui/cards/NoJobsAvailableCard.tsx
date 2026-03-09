import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type NoJobsAvailableCardProps = {
    className?: string;
};

const NoJobsAvailableCard = ({ className }: NoJobsAvailableCardProps) => {
    const { t } = useTranslation();

    return (
        <View
            className={`${className} items-center rounded-2xl border border-[#E4E4E4] bg-[#F7F7F7] px-6 py-10`}
        >
            <Image
                source={require("@/assets/images/holiday.svg")}
                contentFit="contain"
                style={{ width: 130, height: 130 }}
            />

            <Text className="mt-1 text-center font-proximanova-semibold text-[30px] text-[#1F1F1F]">
                {t("common.noJobsAvailable")}
            </Text>
            <Text className="mt-2 text-center font-proximanova-regular text-[15px] text-[#8C8C8C]">
                {t("common.noJobsAvailableDescription")}
            </Text>
        </View>
    );
};

export default NoJobsAvailableCard;
