import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import NamePlateCard from "@/components/ui/cards/NamePlateCard";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
import MultiSelectCompanyDropdown from "@/components/ui/inputs/MultiSelectCompanyDropdown";
import EditBadgeModal from "@/components/ui/modals/EditBadgeModal";
import InterestModal from "@/components/ui/modals/InterestModal";
import { useProfileStore } from "@/stores/profileStore";
import { Companies, Company } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Edit = () => {
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "sports",
    "music",
    "photography",
    "art",
  ]);
  const [profileData, setProfileData] = useState<any>(null);
  const [shortIntro, setShortIntro] = useState("");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Companies[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const getProfile = useProfileStore((state) => state.getProfile);
  const syncExperiences = useProfileStore((state) => state.syncExperiences);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const result = await getProfile();
        if (isMounted) {
          setProfileData(result.data);
          setShortIntro(result.data?.bio || "");
          if (Array.isArray(result.data?.interest)) {
            setSelectedInterests(result.data.interest);
          }
          if (Array.isArray(result.data?.experiences)) {
            const mappedExperiences: Companies[] = result.data.experiences.map(
              (exp: any) => ({
                companyId: exp.companyId,
                companyName: exp?.company?.name || "Company",
                logo: exp?.company?.logo || undefined,
                startDate: exp.startDate || "",
                endDate: exp.endDate || "",
                position: exp.position || "",
                description: exp.description || "",
                isCurrent: Boolean(exp.isCurrent),
              })
            );

            const companyMap = new Map<string, Company>();
            mappedExperiences.forEach((exp) => {
              if (!companyMap.has(exp.companyId)) {
                companyMap.set(exp.companyId, {
                  id: exp.companyId,
                  name: exp.companyName || "Company",
                });
              }
            });

            setWorkExperiences(mappedExperiences);
            setSelectedCompanies(Array.from(companyMap.values()));
          }
          if (result.data?.social && typeof result.data.social === "object") {
            setSocialLinks(result.data.social);
          }
        }
      } catch {
        // Silent fail to keep edit screen stable.
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [getProfile]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      // Keep one draft per company from UI
      const uniqueExperienceDrafts = new Map<string, Companies>();
      workExperiences.forEach((exp) => {
        if (!exp?.companyId) return;
        if (!uniqueExperienceDrafts.has(exp.companyId)) {
          uniqueExperienceDrafts.set(exp.companyId, exp);
        }
      });

      const payload = {
        bio: shortIntro,
        interest: selectedInterests,
        social: socialLinks,
      };

      const result = await updateProfile(payload);
      await syncExperiences(
        Array.from(uniqueExperienceDrafts.values()),
        Array.isArray(profileData?.experiences) ? profileData.experiences : []
      );
      await getProfile(true);

      const messageKey = result?.message || "profile_updated_successfully";
      toast.success(translateApiMessage(messageKey));
      router.replace({
        pathname: "/(tabs)/user-profile",
        params: { refreshAt: Date.now().toString() },
      });
    } catch (error: any) {
      const messageKey = error?.message || "UNKNOWN_ERROR";
      toast.error(translateApiMessage(messageKey));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{
          paddingTop: insets.top + 10,
        }}
        className="bg-[#E5F4FD] rounded-b-2xl px-4 pb-6 mb-6"
        onPressBack={() => router.back()}
        title="Edit Profile"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView>
        <View className="mx-5">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Your Nameplate
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/nameplate-options")}
            >
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <NamePlateCard
            variant="variant5"
            name={profileData?.name || profileData?.email || "User"}
            address={profileData?.address?.address || "Location unavailable"}
            profileImage={
              profileData?.avatar ||
              require("@/assets/images/placeholder.png")
            }
          />
        </View>

        {/* Badge item */}
        <View>
          <View className="mx-5 flex-row justify-between mt-8 items-center">
            <View className="flex-row gap-2.5 items-center">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center ">
                <FontAwesome6 name="id-badge" size={14} color="black" />
              </View>
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Badge
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsBadgeVisible(true)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <BadgeCard className="mx-5 mt-3.5" />
        </View>


        <EditBadgeModal
          visible={isBadgeVisible}
          onClose={() => setIsBadgeVisible(false)}
        />

        {/* short intro */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="file-document-check-outline"
                  size={16}
                  color="black"
                />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Short Intro
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditingIntro((prev) => !prev)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                {isEditingIntro ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mx-5 mt-4">
            {isEditingIntro ? (
              <TextInput
                value={shortIntro}
                onChangeText={setShortIntro}
                placeholder="Type here..."
                placeholderTextColor="#7A7A7A"
                className="w-full text-sm text-primary border border-[#0000000D] rounded-xl p-3"
                multiline
                textAlignVertical="top"
              />
            ) : (
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary border border-[#0000000D] rounded-xl p-3">
                {shortIntro || "No bio yet."}
              </Text>
            )}
          </View>
        </View>


        {/* Experience */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="file-document-check-outline"
                  size={16}
                  color="black"
                />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Experience
              </Text>
            </View>
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              Edit
            </Text>
          </View>
          <View className="mx-5 mt-4">
            <MultiSelectCompanyDropdown
              selectedCompanies={selectedCompanies}
              workExperiences={workExperiences}
              onCompaniesChange={setSelectedCompanies}
              onWorkExperiencesChange={setWorkExperiences}
            />
          </View>
        </View>

        {/*  Interests */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="file-document-check-outline"
                  size={16}
                  color="black"
                />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Interests
              </Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mx-5 mt-4">
            <InterestSelection
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
              readonly
              showSelectedOnly
            />
          </View>
        </View>

        <InterestModal
          visible={visible}
          initialInterests={selectedInterests}
          onClose={(next) => {
            setSelectedInterests(next);
            setVisible(false);
          }}
        />

        {/* Contact Us On */}
        <View className="flex-row justify-between items-center mx-5 mt-8 ">
          <View className="flex-row gap-2.5">
            <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
              <Ionicons name="call-outline" size={16} color="black" />
            </View>
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              Contact Us On
            </Text>
          </View>
          <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
            Edit
          </Text>
        </View>

        <ConnectSocials
          className="mx-5 my-4"
          value={socialLinks}
          onChange={(next) => setSocialLinks((prev: any) => ({ ...prev, ...next }))}
        />

        <PrimaryButton
          title="Save Changes"
          onPress={handleSaveProfile}
          loading={isSaving}
          className='mx-5 my-10'
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Edit;
