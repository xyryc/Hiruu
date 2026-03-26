import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { Entypo, Fontisto, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import PrimaryButton from "../buttons/PrimaryButton";
import SmallButton from "../buttons/SmallButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const resolveSalaryTypeLabel = (value?: string | null) => {
  if (!value) return "hr";
  if (value === "hourly") return "hr";
  if (value === "monthly") return "mo";
  return value;
};

type DropdownOption = {
  label: string;
  value: string;
  avatar?: string;
};

type BusinessOfferModalProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

const normalizeRoleLabel = (item: any) =>
  item?.role?.name ||
  item?.role?.role?.name ||
  item?.name ||
  item?.title ||
  "";

const BusinessOfferModal = ({ visible, onClose, userId }: BusinessOfferModalProps) => {
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
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
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
    if (showDetails) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_WIDTH);
    }
  }, [showDetails, slideAnim]);

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
            label: item?.name || "Business",
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
        toast.error(error?.message || "Failed to load businesses");
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
  }, [getMyBusinesses, selectedBusinesses, visible]);

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
          .map((item: any) => ({
            label: normalizeRoleLabel(item),
            value: item?.id || item?.roleId || "",
          }))
          .filter((item: DropdownOption) => item.label && item.value);

        if (!normalizedRoles.length) {
          const fallbackRoles = await getMyBusinessRoles(selectedBusiness);
          if (!active) return;

          normalizedRoles = (Array.isArray(fallbackRoles) ? fallbackRoles : [])
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
        toast.error(error?.message || "Failed to load invite options");
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
    visible,
  ]);

  const handleDone = () => {
    if (showDetails) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowDetails(false);
        onClose();
      });
    } else {
      onClose();
    }
  };

  const handleApplyNow = async () => {
    if (!selectedBusiness) {
      toast.error("Please select a business.");
      return;
    }

    if (!selectedRole) {
      toast.error("Please select a role.");
      return;
    }

    const parsedMinSalary = Number(salaryMin);
    const parsedMaxSalary = Number(salaryMax);

    if (!Number.isFinite(parsedMinSalary) || !Number.isFinite(parsedMaxSalary)) {
      toast.error("Please enter a valid salary range.");
      return;
    }

    if (parsedMinSalary > parsedMaxSalary) {
      toast.error("Minimum salary cannot be greater than maximum salary.");
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
      toast.success("Offer sent successfully.");
      setShowDetails(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send offer");
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
  const profileName = profile?.user?.name || "Candidate";
  const profileHeadline = profile?.headline || profile?.highlightedExperience || "Open to work";
  const salaryLabel =
    salaryMin || salaryMax
      ? `${salaryMin || "-"}-${salaryMax || "-"}$/${resolveSalaryTypeLabel(
        profile?.preferredSalaryType
      )}`
      : "Salary not set";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7 items-center">
            <ScrollView showsVerticalScrollIndicator={false}>
              {isLoadingProfile ? (
                <View className="py-8 items-center">
                  <ActivityIndicator color="#4FB2F3" />
                </View>
              ) : null}

              {/* image */}
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
                  {salaryLabel} <Fontisto name="star" size={14} color="#F1C400" />
                </Text>
              </View>

              {/* note */}
              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
                To apply for this job, please share Details so the business can
                contact you.
              </Text>

              {/* business */}
              <View className="mb-7">
                <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                  Business
                </Text>

                <SelectDropdown
                  placeholder={
                    isLoadingBusinesses ? "Loading businesses..." : "Choose a business"
                  }
                  options={businessOptions}
                  value={selectedBusiness}
                  onSelect={(value) => setSelectedBusiness(value)}
                  listMaxHeight={320}
                />
              </View>

              <View className="mb-7">
                <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                  Role
                </Text>

                <SelectDropdown
                  placeholder={isLoadingRoles ? "Loading roles..." : "Choose a role"}
                  options={roleOptions}
                  value={selectedRole}
                  onSelect={(value) => setSelectedRole(value)}
                  listMaxHeight={320}
                />
              </View>

              <View>
                <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                  Salary Per Hour
                </Text>

                <View className="flex-row gap-3">
                  <TextInput
                    placeholder="Min: $5"
                    value={salaryMin}
                    onChangeText={setSalaryMin}
                    className="w-[48%] px-4 py-3.5 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A] placeholder:font-proximanova-regular text-sm"
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />

                  <TextInput
                    placeholder="Max: $10"
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
                title="Apply Now"
                className="mt-7"
                onPress={handleApplyNow}
                loading={isSubmitting}
                disabled={
                  isLoadingProfile ||
                  isLoadingBusinesses ||
                  isLoadingRoles
                }
              />
            </ScrollView>
          </SafeAreaView>

          {/* Details Screen - Slides from Right */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <SafeAreaView
              edges={["bottom"]}
              className="flex-1 px-5 py-7 justify-center"
            >
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
                Offer sent successfully!
              </Text>

              {/* note */}
              <Text className="w-4/6 mx-auto text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
                You sent offer to {profileName}. He may contact you
                soon. Good luck!
              </Text>

              <View>
                <SmallButton
                  onPress={handleBackToJobBoard}
                  className="bg-white border-hairline mt-5"
                  title="Back to Job Board"
                  textClass="!text-primary"
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default BusinessOfferModal;
