import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ServerStatusScreenProps = {
  message?: string;
  onReload: () => void | Promise<void>;
};

const ServerStatusScreen = ({ message, onReload }: ServerStatusScreenProps) => {
  const { t } = useTranslation();
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    if (isReloading) return;

    try {
      setIsReloading(true);
      await onReload();
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <View className="flex-1 justify-center px-6">
        <StatusStateCard
          image={require("@/assets/images/error.svg")}
          title={t("common.serverStatus.title")}
          text={
            message ||
            t("common.serverStatus.description")
          }
        />

        <PrimaryButton
          className="mt-8 self-center"
          title={
            isReloading
              ? t("common.serverStatus.reloading")
              : t("common.serverStatus.reload")
          }
          onPress={() => {
            void handleReload();
          }}
          loading={isReloading}
        />
      </View>
    </SafeAreaView>
  );
};

export default ServerStatusScreen;
