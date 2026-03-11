import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileSwitchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUserProfile: () => void;
  onSelectBusinessProfile: (businessId: string) => void;
}

const ProfileSwitchModal: React.FC<ProfileSwitchModalProps> = ({
  visible,
  onClose,
  onSelectUserProfile,
  onSelectBusinessProfile,
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const getProfile = useProfileStore((state) => state.getProfile);
  const {
    myBusinesses,
    myBusinessesLoading,
    getMyBusinesses,
    selectedBusinesses,
  } = useBusinessStore();
  const selectedBusinessId = selectedBusinesses[0] || null;

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        setProfileLoading(true);
        const result = await getProfile();
        if (isMounted) {
          setProfile(result.data);
        }
      } catch {
        // keep modal usable even if profile fetch fails
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }

      getMyBusinesses(true).catch(() => undefined);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [visible, getMyBusinesses, getProfile]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[45%]">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-6 py-7">
            <Text className="font-proximanova-bold text-xl text-center text-primary">
              Switch profile
            </Text>

            <TouchableOpacity
              onPress={onSelectUserProfile}
              className="mt-6 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row items-center"
            >
              <Image
                source={profile?.avatar || require("@/assets/images/placeholder.png")}
                style={{ width: 34, height: 34, borderRadius: 999 }}
                contentFit="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="font-proximanova-semibold text-primary">
                  {profile?.name || "User profile"}
                </Text>
                {!!profile?.email && (
                  <Text className="text-xs text-secondary">{profile.email}</Text>
                )}
              </View>

              {selectedBusinessId === null && (
                <Ionicons name="checkmark-circle" size={24} color="#4FB2F3" />
              )}

            </TouchableOpacity>

            <Text className='font-proximanova-medium text-lg mt-3'>Your Business Profiles</Text>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {!myBusinessesLoading && myBusinesses.length === 0 && (
                <Text className="text-center text-sm text-secondary py-4">
                  No businesses found.
                </Text>
              )}

              {myBusinesses.map((business) => {
                const addressLabel = business?.address?.address || "";
                return (
                  <TouchableOpacity
                    key={business.id}
                    onPress={() => onSelectBusinessProfile(business.id)}
                    className="mt-3 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row items-center"
                  >
                    <Image
                      source={business.logo || require("@/assets/images/placeholder.png")}
                      style={{ width: 34, height: 34, borderRadius: 999 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="font-proximanova-semibold text-primary">
                        {business.name}
                      </Text>
                      {!!addressLabel && (
                        <Text className="text-xs text-secondary" numberOfLines={1}>
                          {addressLabel}
                        </Text>
                      )}
                    </View>

                    {selectedBusinessId === business.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#4FB2F3" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>

        </View>
      </BlurView>
    </Modal>
  );
};

export default ProfileSwitchModal;
