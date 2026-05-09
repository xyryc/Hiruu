import { useBusinessStore } from "@/stores/businessStore";
import { Companies, Company, MultiSelectCompanyDropdownProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import DatePicker from "./DatePicker";

const MultiSelectCompanyDropdown = ({
  selectedCompanies,
  workExperiences,
  onCompaniesChange,
  onWorkExperiencesChange,
}: MultiSelectCompanyDropdownProps) => {
  const { t } = useTranslation();
  const { fetchBusinesses } = useBusinessStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualCompanyName, setManualCompanyName] = useState("");
  const [manualCompanyLogo, setManualCompanyLogo] = useState<any>(null);

  const loadCompanies = useCallback(async (query = "") => {
    try {
      const businesses = await fetchBusinesses(query);

      // Transform API data to Company format
      const transformedCompanies = (Array.isArray(businesses) ? businesses : []).map((business: any) => ({
        id:
          business?.id ||
          business?.businessId ||
          business?._id ||
          business?.uuid ||
          "",
        name: business?.name || business?.businessName || "",
        logo: business?.logo || business?.profileImage || business?.avatar,
      }))
      .filter((company: Company) => Boolean(company.id) && Boolean(company.name));

      setCompanies(transformedCompanies);
    } catch (error) {
      console.error("Failed to load companies:", error);
      toast.error(t("user.profile.multiSelectCompany.failedToLoadCompanies"));
    }
  }, [fetchBusinesses, t]);

  // Fetch companies when component mounts
  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCompanies(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadCompanies, searchQuery]);

  const filteredCompanies = companies;

  const isCompanySelected = (companyId: string) => {
    return selectedCompanies.some((company) => company.id === companyId);
  };

  const toggleCompanySelection = (company: Company) => {
    const isSelected = isCompanySelected(company.id);

    if (isSelected) {
      // Remove company and its work experience
      const updatedCompanies = selectedCompanies.filter(
        (c) => c.id !== company.id,
      );
      const updatedExperiences = workExperiences.filter(
        (exp) => exp.companyId !== company.id,
      );

      onCompaniesChange(updatedCompanies);
      onWorkExperiencesChange(updatedExperiences);
    } else {
      // Add company and create new work experience
      const updatedCompanies = [...selectedCompanies, company];
      const newExperience: Companies = {
        companyId: company.id,
        businessId: company.id,
        companyName: company.name,
        logo: company.logo,
        customBusinessName: undefined,
        customBusinessLogo: null,
        startDate: "",
        endDate: "",
        position: "",
        description: "",
        isCurrent: false,
      };
      const updatedExperiences = [...workExperiences, newExperience];

      onCompaniesChange(updatedCompanies);
      onWorkExperiencesChange(updatedExperiences);
    }
  };

  // Add image picker function
  const pickCompanyLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setManualCompanyLogo({
          uri: asset.uri,
          type: "image/jpeg",
          name: `company_logo_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        t("common.error"),
        t("user.profile.multiSelectCompany.failedToPickImage")
      );
    }
  };

  const addManualCompany = async () => {
    if (!manualCompanyName.trim()) {
      Alert.alert(
        t("common.error"),
        t("user.profile.multiSelectCompany.pleaseEnterCompanyName")
      );
      return;
    }

    try {
      setIsAddingCompany(true);
      const customId = `custom_${Date.now()}`;
      const newCompany: Company = {
        id: customId,
        name: manualCompanyName.trim(),
        logo: manualCompanyLogo?.uri,
        isCustom: true,
      };

      setCompanies([...companies, newCompany]);

      const updatedCompanies = [...selectedCompanies, newCompany];
      const newExperience: Companies = {
        companyId: customId,
        businessId: undefined,
        companyName: newCompany.name,
        logo: newCompany.logo,
        customBusinessName: newCompany.name,
        customBusinessLogo: manualCompanyLogo || null,
        startDate: "",
        endDate: "",
        position: "",
        description: "",
        isCurrent: false,
      };
      const updatedExperiences = [...workExperiences, newExperience];

      onCompaniesChange(updatedCompanies);
      onWorkExperiencesChange(updatedExperiences);
      setManualCompanyName("");
      setManualCompanyLogo(null);

      toast.success(t("user.profile.multiSelectCompany.companyAddedSuccessfully"));
    } catch (error) {
      console.error("Error creating company:", error);
      const message =
        error instanceof Error
          ? error.message
          : t("user.profile.multiSelectCompany.failedToAddCompany");
      toast.error(
        message || t("user.profile.multiSelectCompany.failedToAddCompany")
      );
    } finally {
      setIsAddingCompany(false);
    }
  };

  const updateWorkExperience = (
    companyId: string,
    field: keyof Companies,
    value: any,
  ) => {
    const updatedExperiences = workExperiences.map((exp) =>
      exp.companyId === companyId ? { ...exp, [field]: value } : exp,
    );
    onWorkExperiencesChange(updatedExperiences);
  };

  const toggleCurrentExperience = (companyId: string) => {
    const updatedExperiences = workExperiences.map((exp) => {
      if (exp.companyId !== companyId) return exp;
      const nextIsCurrent = !Boolean(exp.isCurrent);
      return {
        ...exp,
        isCurrent: nextIsCurrent,
        endDate: nextIsCurrent ? null : exp.endDate,
      };
    });
    onWorkExperiencesChange(updatedExperiences);
  };

  const removeCompany = (companyId: string) => {
    const updatedCompanies = selectedCompanies.filter(
      (c) => c.id !== companyId,
    );
    const updatedExperiences = workExperiences.filter(
      (exp) => exp.companyId !== companyId,
    );

    onCompaniesChange(updatedCompanies);
    onWorkExperiencesChange(updatedExperiences);
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCompanyLogoSource = (logo?: string | null) => {
    if (!logo || typeof logo !== "string") return null;
    if (logo.startsWith("http") || logo.startsWith("file://")) {
      return { uri: logo };
    }
    return {
      uri: `${process.env.EXPO_PUBLIC_API_URL}${logo.startsWith("/") ? logo : `/${logo}`}`,
    };
  };

  return (
    <View>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
        className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] flex-row justify-between items-center mb-6"
      >
        <Text
          className={`text-sm  ${selectedCompanies.length > 0 ? "text-primary font-proximanova-semibold" : "text-secondary"}`}
        >
          {selectedCompanies.length > 0
            ? t("user.profile.multiSelectCompany.companySelectedCount", {
              count: selectedCompanies.length,
            })
            : t("user.profile.multiSelectCompany.selectCompanyName")}
        </Text>
        <Text className="text-gray-400 text-lg">▼</Text>
      </TouchableOpacity>

      {/* Work Experience Forms */}
      {selectedCompanies.length > 0 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedCompanies.map((company, index) => {
            const experience = workExperiences.find(
              (exp) => exp.companyId === company.id,
            );
            if (!experience) return null;

            return (
              <View
                key={company.id}
                className="mb-6 bg-white rounded-xl p-4 border border-gray-200"
              >
                {/* Company Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center flex-1 mr-3">
                    {getCompanyLogoSource(company.logo) ? (
                      <Image
                        source={getCompanyLogoSource(company.logo)!}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 999,
                          marginRight: 12,
                        }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-10 h-10 bg-gray-800 rounded-full mr-3 justify-center items-center">
                        <Text className="text-white text-sm font-proximanova-medium">
                          {getCompanyInitials(company.name)}
                        </Text>
                      </View>
                    )}

                    <Text className="text-base font-proximanova-semibold text-gray-900 flex-1">
                      {company.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeCompany(company.id)}
                    className="w-6 h-6 bg-black rounded-full justify-center items-center"
                  >
                    <Text className="text-white text-sm">×</Text>
                  </TouchableOpacity>
                </View>

                {/* Period Section */}
                <View className="mb-4">
                  <Text className="text-sm font-proximanova-semibold text-gray-900 mb-3">
                    {t("user.profile.multiSelectCompany.period")}
                  </Text>

                  <TouchableOpacity
                    onPress={() => toggleCurrentExperience(company.id)}
                    className="flex-row items-center mb-3"
                    activeOpacity={0.8}
                  >
                    <View
                      className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                        experience.isCurrent ? "bg-[#11293A] border-[#11293A]" : "border-[#D1D5DB] bg-white"
                      }`}
                    >
                      {experience.isCurrent ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <Text className="text-sm text-gray-800 font-proximanova-regular">
                      {t("user.setup.stillWorking", { defaultValue: "Still working here" })}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row gap-3">
                    {/* Start Date */}
                    <View className="flex-1">
                      <DatePicker
                        title={t("user.profile.multiSelectCompany.startDate")}
                        value={
                          experience.startDate
                            ? new Date(experience.startDate)
                            : undefined
                        }
                        onChange={(date) =>
                          updateWorkExperience(company.id, "startDate", date)
                        }
                      />
                    </View>

                    {/* End Date */}
                    <View className="flex-1">
                      {experience.isCurrent ? (
                        <View className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-100">
                          <Text className="text-gray-500 text-base">
                            {t("user.setup.present", { defaultValue: "Present" })}
                          </Text>
                          <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                        </View>
                      ) : (
                        <DatePicker
                          title={t("user.profile.multiSelectCompany.endDate")}
                          value={
                            experience.endDate
                              ? new Date(experience.endDate)
                              : undefined
                          }
                          onChange={(date) =>
                            updateWorkExperience(company.id, "endDate", date)
                          }
                        />
                      )}
                    </View>
                  </View>
                </View>

                {/* Job Title */}
                <View>
                  <Text className="text-sm font-proximanova-semibold text-gray-900 mb-3">
                    {t("user.profile.multiSelectCompany.jobTitle")}
                  </Text>
                  <TextInput
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder={t("user.profile.multiSelectCompany.enterYourRole")}
                    value={experience.position}
                    onChangeText={(text) =>
                      updateWorkExperience(company.id, "position", text)
                    }
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Company Selection Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text className="text-blue-500 text-lg">{t("user.profile.done")}</Text>
              </TouchableOpacity>
              <Text className="text-lg font-proximanova-semibold text-gray-900">
                {t("user.profile.multiSelectCompany.companyEmployer")}
              </Text>
              <View className="w-16" />
            </View>

            {/* Search */}
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-gray-400 mr-3">🔍</Text>
                <TextInput
                  className="flex-1 text-sm"
                  placeholder={t("user.profile.multiSelectCompany.searchHere")}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <ScrollView
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            >
              {/* Company List */}
              {filteredCompanies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  onPress={() => toggleCompanySelection(company)}
                  className="flex-row items-center py-2 px-6 border-b border-gray-50"
                >
                  {/* Company Logo */}
                  {company?.logo ? (
                    <Image
                      source={{
                        uri: company.logo.startsWith("http")
                          ? company.logo
                          : `${process.env.EXPO_PUBLIC_API_URL}${company.logo}`,
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        marginRight: 12,
                      }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-10 h-10 bg-gray-800 rounded-full mr-3 justify-center items-center">
                      <Text className="text-white text-sm font-proximanova-medium">
                        {getCompanyInitials(company.name)}
                      </Text>
                    </View>
                  )}

                  {/* Company Name */}
                  <Text className="text-base text-gray-900 flex-1">
                    {company.name}
                  </Text>

                  {/* Selection Indicator */}
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${isCompanySelected(company.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                      } justify-center items-center`}
                  >
                    {isCompanySelected(company.id) && (
                      <Text className="text-white text-xs font-proximanova-bold">
                        ✓
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Add Company Manually */}
              <View className="p-6 border-t border-gray-200 mt-4">
                <TouchableOpacity
                  className="flex-row items-center mb-4"
                  onPress={pickCompanyLogo}
                >
                  <View className="w-10 h-10 bg-[#11293A] rounded-full mr-4 justify-center items-center">
                    {manualCompanyLogo ? (
                      <Image
                        source={{ uri: manualCompanyLogo.uri }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons name="camera-outline" size={20} color="white" />
                    )}
                  </View>

                  <Text className="text-base text-gray-900 font-proximanova-medium flex-1">
                    {manualCompanyLogo
                      ? t("user.profile.multiSelectCompany.changeCompanyLogo")
                      : t("user.profile.multiSelectCompany.addCompanyLogoRequired")}
                  </Text>
                </TouchableOpacity>

                <Text className="text-sm text-gray-900 font-proximanova-semibold mb-3">
                  {t("user.profile.multiSelectCompany.companyName")}
                </Text>

                <View className="flex-row items-center space-x-3">
                  <View className="flex-1">
                    <TextInput
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm"
                      placeholder={t("user.profile.multiSelectCompany.typeHere")}
                      value={manualCompanyName}
                      onChangeText={setManualCompanyName}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={addManualCompany}
                    disabled={
                      isAddingCompany || !manualCompanyName.trim()
                    }
                    className={`px-6 py-3 rounded-xl ${manualCompanyName.trim() && !isAddingCompany
                      ? "bg-[#11293A]"
                      : "bg-gray-300"
                      }`}
                  >
                    <Text className="text-white font-proximanova-medium">
                      {isAddingCompany
                        ? t("user.profile.multiSelectCompany.adding")
                        : t("user.profile.multiSelectCompany.add")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default MultiSelectCompanyDropdown;
