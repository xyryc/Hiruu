import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { Entypo, Fontisto, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import PrimaryButton from "../buttons/PrimaryButton";
import SmallButton from "../buttons/SmallButton";

type DropdownOption = {
  label: string;
  value: string;
  avatar?: string;
};

type BusinessOfferModalProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
  alreadyOffered?: boolean;
  onOfferSent?: () => void;
  onViewProfileRequest?: (payload: { userId: string; profileId?: string }) => void;
};

const normalizeRoleLabel = (item: any) =>
  item?.role?.name ||
  item?.role?.role?.name ||
  item?.name ||
  item?.title ||
  "";

const isRoleSelectableForOffer = (item: any) => {
  // Hide locked/system roles (e.g. Owner) from offer flow.
  if (item?.isSystemLocked === true) return false;
  if (item?.role?.isSystemLocked === true) return false;
  return true;
};

const BusinessOfferModal = ({
  visible,
  onClose,
  userId,
  alreadyOffered = false,
  onOfferSent,
  onViewProfileRequest,
}: BusinessOfferModalProps) => {
  const { t } = useTranslation();
  const getJobProfileByUserId = useJobStore((state) => state.getJobProfileByUserId);
  const inviteCandidateToRecruitment = useJobStore(
    (state) => state.inviteCandidateToRecruitment
  );
  const getMyBusinesses = useBusinessStore((state) => state.getMyBusinesses);
  const getMyBusinessRoles = useBusinessStore((state) => state.getMyBusinessRoles);
  const getBusinessRolesDetailed = useBusinessStore(
    (state) => state.getBusinessRolesDetailed
  );
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const [showDetails, setShowDetails] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessOptions, setBusinessOptions] = useState<DropdownOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<DropdownOption[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  useEffect(() => {
    if (!visible || !userId) {
      if (!visible) {
        setProfile(null);
        setShowDetails(false);
        setSelectedBusiness("");
        setSelectedRole("");
        setRoleOptions([]);
      }
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const result = await getJobProfileByUserId(userId);
        if (!active) return;
        setProfile(result);
      } catch {
        if (!active) return;
        setProfile(null);
      } finally {
        if (active) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [getJobProfileByUserId, userId, visible]);

  useEffect(() => {
    if (!visible) {
      setBusinessOptions([]);
      return;
    }

    let active = true;

    const loadBusinesses = async () => {
      try {
        setIsLoadingBusinesses(true);
        const businesses = await getMyBusinesses();
        if (!active) return;

        const normalized = (Array.isArray(businesses) ? businesses : [])
          .map((item: any) => ({
            label: item?.name || t("user.profile.businessSummary.businessFallback"),
            value: item?.id || "",
            avatar: item?.logo || undefined,
          }))
          .filter((item: DropdownOption) => item.value);

        setBusinessOptions(normalized);

        const preferredBusinessId =
          selectedBusinesses.find((id) =>
            normalized.some((item) => item.value === id)
          ) ||
          normalized[0]?.value ||
          "";

        setSelectedBusiness((prev) =>
          prev && normalized.some((item) => item.value === prev)
            ? prev
            : preferredBusinessId
        );
      } catch (error: any) {
        if (!active) return;
        setBusinessOptions([]);
        toast.error(error?.message || t("user.profile.failedToLoadBusinesses"));
      } finally {
        if (active) {
          setIsLoadingBusinesses(false);
        }
      }
    };

    loadBusinesses();

    return () => {
      active = false;
    };
  }, [getMyBusinesses, selectedBusinesses, t, visible]);

  useEffect(() => {
    if (!visible || !selectedBusiness) {
      setRoleOptions([]);
      setSelectedRole("");
      return;
    }

    let active = true;

    const loadInviteDependencies = async () => {
      try {
        setIsLoadingRoles(true);
        const roles = await getBusinessRolesDetailed(selectedBusiness);

        if (!active) return;

        let normalizedRoles = (Array.isArray(roles) ? roles : [])
          .filter((item: any) => isRoleSelectableForOffer(item))
          .map((item: any) => ({
            label: normalizeRoleLabel(item),
            value: item?.id || item?.roleId || "",
          }))
          .filter((item: DropdownOption) => item.label && item.value);

        if (!normalizedRoles.length) {
          const fallbackRoles = await getMyBusinessRoles(selectedBusiness);
          if (!active) return;

          normalizedRoles = (Array.isArray(fallbackRoles) ? fallbackRoles : [])
            .filter((item: any) => isRoleSelectableForOffer(item))
            .map((item: any) => ({
              label: normalizeRoleLabel(item),
              value: item?.id || item?.roleId || "",
            }))
            .filter((item: DropdownOption) => item.label && item.value);
        }

        setRoleOptions(normalizedRoles);

        setSelectedRole((prev) => {
          if (prev && normalizedRoles.some((item) => item.value === prev)) {
            return prev;
          }

          return normalizedRoles[0]?.value || "";
        });
      } catch (error: any) {
        if (!active) return;
        setRoleOptions([]);
        setSelectedRole("");
        toast.error(error?.message || t("user.jobs.businessOfferModal.failedToLoadInviteOptions"));
      } finally {
        if (active) {
          setIsLoadingRoles(false);
        }
      }
    };

    loadInviteDependencies();

    return () => {
      active = false;
    };
  }, [
    getBusinessRolesDetailed,
    getMyBusinessRoles,
    selectedBusiness,
    t,
    visible,
  ]);

  const handleDone = () => {
    setShowDetails(false);
    onClose();
  };

  const handleApplyNow = async () => {
    if (alreadyOffered) {
      toast.info(t("user.jobs.businessJobCard.offerAlreadySent"));
      return;
    }
    if (!selectedBusiness) {
      toast.error(t("user.jobs.businessOfferModal.selectBusinessRequired"));
      return;
    }

    if (!selectedRole) {
      toast.error(t("user.jobs.businessOfferModal.selectRoleRequired"));
      return;
    }

    const parsedMinSalary = Number(salaryMin);
    const parsedMaxSalary = Number(salaryMax);

    if (!Number.isFinite(parsedMinSalary) || !Number.isFinite(parsedMaxSalary)) {
      toast.error(t("user.jobs.businessOfferModal.invalidSalaryRange"));
      return;
    }

    if (parsedMinSalary > parsedMaxSalary) {
      toast.error(t("user.jobs.businessOfferModal.minGreaterThanMax"));
      return;
    }

    try {
      setIsSubmitting(true);
      await inviteCandidateToRecruitment(selectedBusiness, {
        userId,
        roleId: selectedRole,
        minSalary: parsedMinSalary,
        maxSalary: parsedMaxSalary,
      });
      toast.success(t("user.jobs.businessOfferModal.offerSentSuccessToast"));
      onOfferSent?.();
      setShowDetails(true);
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.businessOfferModal.failedToSendOffer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToJobBoard = () => {
    handleDone();
    setShowDetails(false);
    // router.replace("/(tabs)/business-jobs");
  };

  useEffect(() => {
    if (!visible) {
      setSalaryMin("");
      setSalaryMax("");
      return;
    }

    setSalaryMin(
      profile?.expectedSalaryMin !== null && profile?.expectedSalaryMin !== undefined
        ? String(profile.expectedSalaryMin)
        : ""
    );
    setSalaryMax(
      profile?.expectedSalaryMax !== null && profile?.expectedSalaryMax !== undefined
        ? String(profile.expectedSalaryMax)
        : ""
    );
  }, [profile, visible]);

  const profileAvatar = profile?.user?.avatar || require('@/assets/images/placeholder.png')
  const profileName = profile?.user?.name || t("user.jobs.businessOfferModal.candidateFallback");
  const profileHeadline =
    profile?.headline ||
    profile?.highlightedExperience ||
    t("user.jobs.businessOfferModal.openToWorkFallback");
  const ratingValue = Number(profile?.user?.rating ?? 0);
  const ratingLabel =
    Number.isFinite(ratingValue) && ratingValue > 0
      ? `${ratingValue.toFixed(1)}/5`
      : "N/A";
  const isModalLoading = isLoadingProfile || isLoadingBusinesses || isLoadingRoles;


  const handleProfilePress = () => {
    const targetUserId = profile?.userId || profile?.user?.id;

    if (!targetUserId) {
      toast.error(t("user.jobs.businessJobCard.userInfoUnavailable"));
      return;
    }

    onViewProfileRequest?.({
      userId: targetUserId,
      profileId: profile?.id || "",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          {!showDetails ? (
            <SafeAreaView edges={["bottom"]} className="px-5 py-7 items-center">
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: screenHeight * 0.72, width: "100%" }}
              >
                {isModalLoading ? (
                  <View pointerEvents="none">
                    <View className="h-[100px] w-[100px] mx-auto rounded-full bg-[#E5E7EB]" />
                    <View className="mt-3 h-6 w-48 mx-auto rounded-md bg-[#E5E7EB]" />
                    <View className="mt-3 h-4 w-56 mx-auto rounded-md bg-[#E5E7EB]" />
                    <View className="mt-6 h-4 w-28 rounded-md bg-[#E5E7EB]" />
                    <View className="mt-2.5 h-12 w-full rounded-xl bg-[#E5E7EB]" />
                    <View className="mt-6 h-4 w-20 rounded-md bg-[#E5E7EB]" />
                    <View className="mt-2.5 h-12 w-full rounded-xl bg-[#E5E7EB]" />
                    <View className="mt-6 h-4 w-28 rounded-md bg-[#E5E7EB]" />
                    <View className="mt-2.5 flex-row gap-3">
                      <View className="h-12 w-[48%] rounded-xl bg-[#E5E7EB]" />
                      <View className="h-12 w-[48%] rounded-xl bg-[#E5E7EB]" />
                    </View>
                    <View className="mt-7 h-12 w-full rounded-full bg-[#E5E7EB]" />
                  </View>
                ) : (
                  <>
                    {/* image */}
                    <TouchableOpacity onPress={handleProfilePress}>
                      <Image
                        source={profileAvatar}
                        style={{
                          width: 100,
                          height: 100,
                          marginHorizontal: "auto",
                          borderRadius: 999,
                        }}
                        contentFit="cover"
                      />

                      {/* name */}
                      <Text className="text-xl text-center font-proximanova-semibold text-primary dark:text-dark-primary mt-2.5">
                        {profileName}
                      </Text>
                    </TouchableOpacity>
                    {/* location */}
                    <View className="flex-row items-center justify-center mt-2.5 gap-7">
                      <View className="flex-row items-center gap-2.5 border-r-hairline border-[#7A7A7A] pr-7">
                        <SimpleLineIcons
                          name="location-pin"
                          size={20}
                          color="#7A7A7A"
                        />
                        <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                          {profileHeadline}
                        </Text>
                      </View>

                      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                        {ratingLabel} <Fontisto name="star" size={14} color="#F1C400" />
                      </Text>
                    </View>

                    {/* note */}
                    <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
                      {t("user.jobs.businessOfferModal.note")}
                    </Text>

                    {/* business */}
                    <View className="mb-7">
                      <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                        {t("user.profile.businessSummary.businessFallback")}
                      </Text>

                      <SelectDropdown
                        placeholder={t("user.jobs.businessOfferModal.chooseBusiness")}
                        options={businessOptions}
                        value={selectedBusiness}
                        onSelect={(value) => setSelectedBusiness(value)}
                        listMaxHeight={320}
                      />
                    </View>

                    <View className="mb-7">
                      <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                        {t("user.jobs.postJob.role")}
                      </Text>

                      <SelectDropdown
                        placeholder={t("user.jobs.businessOfferModal.chooseRole")}
                        options={roleOptions}
                        value={selectedRole}
                        onSelect={(value) => setSelectedRole(value)}
                        listMaxHeight={320}
                      />
                    </View>

                    <View>
                      <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                        {t("user.jobs.businessOfferModal.salaryPerHour")}
                      </Text>

                      <View className="flex-row gap-3">
                        <TextInput
                          placeholder={t("user.jobs.businessOfferModal.salaryMinPlaceholder", { amount: 5 })}
                          value={salaryMin}
                          onChangeText={setSalaryMin}
                          className="w-[48%] px-4 py-3.5 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A] placeholder:font-proximanova-regular text-sm"
                          keyboardType="numeric"
                          autoCapitalize="none"
                        />

                        <TextInput
                          placeholder={t("user.jobs.businessOfferModal.salaryMaxPlaceholder", { amount: 10 })}
                          value={salaryMax}
                          onChangeText={setSalaryMax}
                          className="w-[48%] px-4 py-3.5 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A] placeholder:font-proximanova-regular text-sm"
                          keyboardType="numeric"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* button */}
                    <PrimaryButton
                      title={
                        alreadyOffered
                          ? t("user.jobs.businessOfferModal.alreadySent")
                          : t("user.jobs.businessOfferModal.sendOffer")
                      }
                      className="mt-7"
                      onPress={handleApplyNow}
                      loading={isSubmitting}
                      disabled={alreadyOffered}
                    />
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          ) : (
            <SafeAreaView edges={["bottom"]} className="px-5 py-7 items-center">
              <Image
                source={require("@/assets/images/complete.svg")}
                style={{
                  width: 156,
                  height: 120,
                  alignSelf: "center",
                }}
                contentFit="cover"
              />

              <Text className="text-center text-lg font-proximanova-semibold mt-3 mb-2">
                {t("user.jobs.businessOfferModal.successTitle")}
              </Text>

              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center">
                {t("user.jobs.businessOfferModal.successText", { name: profileName })}
              </Text>


              <View className="w-full mt-5">
                <SmallButton
                  onPress={handleBackToJobBoard}
                  className="w-full bg-white border-hairline"
                  title={t("user.jobs.businessOfferModal.backToJobBoard")}
                  textClass="!text-primary"
                />
              </View>
            </SafeAreaView>
          )}
        </View>
      </BlurView>
    </Modal>
  );
};

export default BusinessOfferModal;
