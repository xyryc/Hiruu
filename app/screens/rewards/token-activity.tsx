import ScreenHeader from "@/components/header/ScreenHeader";
import UserCalendarScheduleModal from "@/components/ui/modals/UserCalendarScheduleModal";
import { walletService } from "@/services/walletService";
import { useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TransactionType = "earned" | "spent";

type CoinTransaction = {
  id: string;
  amount: number;
  description?: string | null;
  createdAt: string;
  type?: TransactionType;
  user?: {
    avatar?: string | null;
  } | null;
};

const formatYmd = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TokenActivityItemSkeleton = ({ first }: { first?: boolean }) => (
  <View className={`flex-row justify-between ${first ? "mt-3" : "mt-5"}`}>
    <View className="flex-row gap-2.5 items-center flex-1 pr-4">
      <View className="w-10 h-10 rounded-full bg-[#E5E7EB]" />
      <View className="flex-1">
        <View className="h-4 w-44 rounded-md bg-[#E5E7EB]" />
        <View className="mt-2 h-3 w-24 rounded-md bg-[#E5E7EB]" />
      </View>
    </View>

    <View className="flex-row gap-1.5 items-center">
      <View className="h-5 w-14 rounded-md bg-[#E5E7EB]" />
      <View className="w-[22px] h-[22px] rounded-full bg-[#E5E7EB]" />
    </View>
  </View>
);

const TokenActivityGroupSkeleton = ({ showDivider = false }: { showDivider?: boolean }) => (
  <View>
    <View className="mx-5">
      <View className="mt-4 h-6 w-40 rounded-md bg-[#E5E7EB]" />
      <TokenActivityItemSkeleton first />
      <TokenActivityItemSkeleton />
      <TokenActivityItemSkeleton />
    </View>
    {showDivider ? <View className="mt-5 border-b-4 border-[#F5F5F5]" /> : null}
  </View>
);

const TokenActivity = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t, i18n } = useTranslation();
  const intlLocale = i18n.language === "gr" ? "el-GR" : "en-US";
  const topTabs: ("all" | TransactionType)[] = ["all", "earned", "spent"];
  const [isTabs, setIsTabs] = useState<"all" | TransactionType>("all");
  const [reportMonth, setReportMonth] = useState<Date | null>(new Date());
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const current = new Date();
    const y = current.getFullYear();
    const m = `${current.getMonth() + 1}`.padStart(2, "0");
    const d = `${current.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [walletCoins, setWalletCoins] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const result = await walletService.getWallet();
      const nextCoins = Number(result?.data?.coins ?? result?.data?.wallet?.coins);
      setWalletCoins(Number.isFinite(nextCoins) ? nextCoins : 0);
    } catch {
      setWalletCoins(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  const walletCoinsLabel = useMemo(
    () => new Intl.NumberFormat(intlLocale).format(walletCoins),
    [intlLocale, walletCoins]
  );

  const loadTransactions = useCallback(
    async (tab: "all" | TransactionType) => {
      setIsLoadingTransactions(true);
      try {
        const activeMonth = reportMonth || new Date();
        const monthStartDate = new Date(
          activeMonth.getFullYear(),
          activeMonth.getMonth(),
          1
        );
        const monthEndDate = new Date(
          activeMonth.getFullYear(),
          activeMonth.getMonth() + 1,
          0
        );
        const dateRange = {
          startDate: formatYmd(monthStartDate),
          endDate: formatYmd(monthEndDate),
        };

        if (tab === "all") {
          const [earnedResult, spentResult] = await Promise.all([
            walletService.getCoinTransactions({
              type: "earned",
              ...dateRange,
            }),
            walletService.getCoinTransactions({
              type: "spent",
              ...dateRange,
            }),
          ]);
          const merged = [
            ...(Array.isArray(earnedResult?.data) ? earnedResult.data : []),
            ...(Array.isArray(spentResult?.data) ? spentResult.data : []),
          ] as CoinTransaction[];
          merged.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransactions(merged);
          return;
        }

        const result = await walletService.getCoinTransactions({
          type: tab,
          ...dateRange,
        });
        const rows = Array.isArray(result?.data)
          ? (result.data as CoinTransaction[])
          : [];
        rows.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTransactions(rows);
      } catch {
        setTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [reportMonth]
  );

  useFocusEffect(
    useCallback(() => {
      loadTransactions(isTabs);
    }, [isTabs, loadTransactions])
  );

  const filteredTransactions = useMemo(() => {
    if (!reportMonth) return transactions;

    const selectedMonth = reportMonth.getMonth();
    const selectedYear = reportMonth.getFullYear();

    return transactions.filter((item) => {
      const d = new Date(item.createdAt);
      return (
        d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
      );
    });
  }, [reportMonth, transactions]);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, CoinTransaction[]>();

    filteredTransactions.forEach((item) => {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const existing = groups.get(key) || [];
      existing.push(item);
      groups.set(key, existing);
    });

    return Array.from(groups.entries())
      .map(([key, items]) => ({ key, items }))
      .sort((a, b) => {
        const [aYear, aMonth] = a.key.split("-").map(Number);
        const [bYear, bMonth] = b.key.split("-").map(Number);
        if (aYear !== bYear) return bYear - aYear;
        return bMonth - aMonth;
      });
  }, [filteredTransactions]);

  const getTransactionDateLabel = (createdAt: string) => {
    const d = new Date(createdAt);
    return d.toLocaleDateString(intlLocale, { day: "numeric", month: "long" });
  };

  const getGroupLabel = (key: string) => {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month, 1).toLocaleDateString(intlLocale, {
      month: "long",
      year: "numeric",
    });
  };

  const handleSelectDate = useCallback((dateString: string) => {
    const selectedDate = new Date(`${dateString}T00:00:00`);
    setSelectedCalendarDate(dateString);
    setReportMonth(selectedDate);
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-5 pt-2"
        title={t("user.profile.tokenActivity.title")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111111"}
        components={
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/hiruu-coin.svg")}
              style={{
                width: 32,
                height: 32,
              }}
              contentFit="contain"
            />
            <View className="px-4 py-2 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
              <Text className="text-sm font-proximanova-semibold">
                {walletCoinsLabel}
              </Text>
            </View>
          </View>
        }
      />

      {/* tabs */}
      <View className="flex-row justify-between items-center mx-5">
        <View className="flex-row gap-2">
          {topTabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className={`px-2.5 py-2 rounded-full ${isTabs === tab ? "bg-[#4FB2F3]" : "bg-[#eeeeee]"}`}
            >
              <Text
                onPress={() => setIsTabs(tab)}
                className={`text-sm capitalize ${tab === isTabs ? "text-[#ffff] font-proximanova-bold" : "text-primary dark:text-dark-primary font-proximanova-semibold"} `}
              >
                {t(`user.profile.tokenActivity.tabs.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setCalendarModalVisible(true)}
          className="px-3 py-2 rounded-full bg-[#EEEEEE]"
        >
          <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
            {reportMonth
              ? reportMonth.toLocaleDateString(intlLocale, {
                  month: "short",
                  year: "numeric",
                })
              : t("common.select")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoadingTransactions ? (
          <View className="pb-6">
            <TokenActivityGroupSkeleton showDivider />
            <TokenActivityGroupSkeleton />
          </View>
        ) : groupedTransactions.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {t("user.profile.tokenActivity.empty")}
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group, groupIndex) => (
            <View key={group.key}>
              <View className="mx-5">
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-4">
                  {getGroupLabel(group.key)}
                </Text>

                {group.items.map((item, index) => {
                  const isEarned = item.type === "earned" || item.amount >= 0;
                  const amount = Math.abs(Number(item.amount || 0));
                  return (
                    <View
                      key={item.id}
                      className={`flex-row justify-between ${index === 0 ? "mt-3" : "mt-5"}`}
                    >
                      <View className="flex-row gap-2.5 items-center flex-1 pr-4">
                        <Image
                          source={
                            item?.user?.avatar ||
                            require("@/assets/images/profile.svg")
                          }
                          contentFit="cover"
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            className="font-proximanova-semibold text-primary dark:text-dark-primary"
                          >
                            {item.description || t("user.profile.tokenActivity.transactionFallback")}
                          </Text>
                          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                            {getTransactionDateLabel(item.createdAt)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row gap-1.5 items-center">
                        <Text
                          className={`font-proximanova-semibold text-lg ${isEarned ? "text-[#3EBF5A]" : "text-[#F34F4F]"}`}
                        >
                          {isEarned ? "+" : "-"}
                          {amount}
                        </Text>
                        <Image
                          source={require("@/assets/images/hiruu-coin.svg")}
                          style={{
                            width: 22,
                            height: 22,
                          }}
                          contentFit="contain"
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {groupIndex !== groupedTransactions.length - 1 ? (
                <View className="mt-5 border-b-4 border-[#F5F5F5]" />
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <UserCalendarScheduleModal
        visible={isCalendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        selectedDate={selectedCalendarDate}
        onSelectDate={handleSelectDate}
      />
    </SafeAreaView>
  );
};

export default TokenActivity;
