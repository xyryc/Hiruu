import { AssignRoleModalProps } from "@/types";
import { Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

const SKELETON_ITEMS = Array.from({ length: 2 }, (_, index) => index);

const AssignRoleModal = ({
  visible,
  onClose,
  assignRole,
  setSelectedAssignRole,
  selectedAssignRole,
  loading = false,
  onApply,
  applying = false,
  emptyStateText = "No roles found.",
}: AssignRoleModalProps) => {
  const [keyboardInset, setKeyboardInset] = React.useState(0);

  React.useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardInset(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleCreateRolePress = () => {
    onClose();
    requestAnimationFrame(() => {
      router.push("/screens/schedule/business/create-role");
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View
          style={{ justifyContent: "flex-end", paddingBottom: keyboardInset }}
          className="flex-1"
        >
          <View
            className="bg-white rounded-t-3xl"
            style={{ maxHeight: keyboardInset > 0 ? "82%" : "60%" }}
          >
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]}>
            {/* Header */}
            <View className="px-6 pt-7 pb-3 flex-row justify-between items-center">
              <Text className="font-proximanova-bold text-xl" numberOfLines={1}>
                Assign Role
              </Text>

              {/* create role button */}
              <TouchableOpacity
                onPress={handleCreateRolePress}
                className="h-10 w-10 bg-[#eeeeee] rounded-full flex-row items-center justify-center">
                <Feather name="edit" size={16} color="black" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2 mx-5">
              <EvilIcons name="search" size={24} color="#666" />
              <TextInput
                placeholder="Search here..."
                className="flex-1 ml-2 py-1.5 text-primary dark:text-dark-primary"
                placeholderTextColor="#999"
                returnKeyType="search"
              />
            </View>

            {/* Business List */}
            <ScrollView
              className="px-4"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 20
              }}
            >
              {loading ? (
                <AutoSkeletonView isLoading={true} defaultRadius={12}>
                  <View pointerEvents="none">
                    {SKELETON_ITEMS.map((index) => (
                      <View
                        key={`assign-role-skeleton-${index}`}
                        className="flex-row items-center py-4 px-4 rounded-xl border-b border-[#eeeeee]"
                      >
                        <View className="flex-1">
                          <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />
                        </View>
                        <View className="w-6 h-6 rounded-full bg-[#E5E7EB]" />
                      </View>
                    ))}
                  </View>
                </AutoSkeletonView>
              ) : assignRole.length === 0 ? (
                <View className="py-8 items-center justify-center px-4">
                  <Text className="text-sm text-secondary text-center mb-4">
                    {emptyStateText}
                  </Text>
                </View>
              ) : (
                assignRole.map((role) => (
                  <TouchableOpacity
                    onPress={() => setSelectedAssignRole(role.id)}
                    key={role.id}
                    className={`flex-row items-center py-4 px-4 rounded-xl border-b border-[#eeeeee] ${selectedAssignRole === role.id ? "bg-[#4FB2F3]" : ""}  `}
                  >
                    {/* Business Name */}
                    <Text
                      className={`flex-1 font-proximanova-semibold ${selectedAssignRole === role.id ? "text-white" : "text-primary"} `}
                    >
                      {role.name}
                    </Text>

                    {/* Selection Indicator */}
                    {selectedAssignRole === role.id && (
                      <Ionicons
                        name="checkmark-circle-sharp"
                        size={24}
                        color="white"
                      />
                    )}
                    {selectedAssignRole === role.id || (
                      <View
                        className={`w-6 h-6 rounded-full border border-[#7a7a7a] justify-center items-center`}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <PrimaryButton
              title={applying ? "Applying..." : "Apply"}
              className="mx-5 mb-5"
              onPress={onApply}
              disabled={loading || applying || assignRole.length === 0}
            />
          </SafeAreaView>
        </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default AssignRoleModal;
