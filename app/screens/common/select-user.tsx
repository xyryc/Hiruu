import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { SelectableUser, useUserSelectionStore } from "@/stores/userSelectionStore";
import axiosInstance from "@/utils/axios";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SelectUserScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams<{
    selectionKey?: string | string[];
    title?: string | string[];
    searchPlaceholder?: string | string[];
  }>();

  const selectionKey = useMemo(() => {
    const value = Array.isArray(params.selectionKey)
      ? params.selectionKey[0]
      : params.selectionKey;
    return value || "default-user-selection";
  }, [params.selectionKey]);

  const screenTitle = useMemo(() => {
    const value = Array.isArray(params.title) ? params.title[0] : params.title;
    return value || "Select User";
  }, [params.title]);

  const searchPlaceholder = useMemo(() => {
    const value = Array.isArray(params.searchPlaceholder)
      ? params.searchPlaceholder[0]
      : params.searchPlaceholder;
    return value || "Search user...";
  }, [params.searchPlaceholder]);

  const selectedUser = useUserSelectionStore(
    (state) => state.selectedUsersByKey[selectionKey] || null
  );
  const setSelectedUser = useUserSelectionStore((state) => state.setSelectedUser);

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SelectableUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(selectedUser?.id || null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users/query/public", {
        params: {
          sort: "",
          page: 1,
          limit: 10,
          search,
        },
      });

      const result = response?.data;
      setUsers(Array.isArray(result?.data) ? result.data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      setSelectedId(selectedUser?.id || null);
      void fetchUsers();
    }, [fetchUsers, selectedUser?.id])
  );

  const handleApply = () => {
    const nextUser = users.find((user) => user.id === selectedId) || null;
    if (!nextUser) return;

    setSelectedUser(selectionKey, nextUser);
    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-5 rounded-b-3xl pt-2.5 overflow-hidden"
        title={screenTitle}
        titleClass="text-primary"
        iconColor={isDark ? "#fff" : "#111111"}
      />

      <View className="flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2 mx-5">
        <EvilIcons name="search" size={24} color="#666" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder}
          className="flex-1 ml-2 py-1.5 text-primary dark:text-dark-primary"
          placeholderTextColor="#999"
          onSubmitEditing={() => void fetchUsers()}
        />
      </View>

      <ScrollView
        className="px-4 pt-5"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
            <Text className="mt-2 text-sm text-secondary">Loading users...</Text>
          </View>
        ) : users.length === 0 ? (
          <View className="py-8 items-center justify-center px-4">
            <Text className="text-sm text-secondary text-center">
              No users found.
            </Text>
          </View>
        ) : (
          users.map((user) => {
            const isSelected = selectedId === user.id;
            const location =
              user.address?.city ||
              user.address?.state ||
              user.address?.country ||
              user.address?.address ||
              "Location unavailable";

            return (
              <TouchableOpacity
                key={user.id}
                onPress={() => setSelectedId(user.id)}
                className={`flex-row items-center gap-3 py-3 px-4 rounded-xl border-b border-[#eeeeee] ${isSelected ? "bg-[#4FB2F3]" : ""
                  }`}
              >
                <Image
                  source={user.avatar || require("@/assets/images/placeholder.png")}
                  style={{ width: 44, height: 44, borderRadius: 999 }}
                  contentFit="cover"
                />

                <View className="flex-1">
                  <Text
                    className={`font-proximanova-semibold ${isSelected ? "text-white" : "text-primary"
                      }`}
                    numberOfLines={1}
                  >
                    {user.name || "Unnamed User"}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${isSelected ? "text-white/90" : "text-secondary"
                      }`}
                    numberOfLines={1}
                  >
                    {location}
                  </Text>
                </View>

                {isSelected ? (
                  <Ionicons
                    name="checkmark-circle-sharp"
                    size={24}
                    color="white"
                  />
                ) : (
                  <View className="w-6 h-6 rounded-full border border-[#7a7a7a]" />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <PrimaryButton
        title="Apply"
        className="mx-5 mb-5"
        onPress={handleApply}
        disabled={!selectedId || loading || users.length === 0}
      />
    </SafeAreaView>
  );
};

export default SelectUserScreen;
