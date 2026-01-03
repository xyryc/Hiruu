import {
  Company,
  MultiSelectCompanyDropdownProps,
  WorkExperience,
} from "@/types";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateOfBirthInput from "./DateOfBirthInput";

const MultiSelectCompanyDropdown = ({
  selectedCompanies,
  workExperiences,
  onCompaniesChange,
  onWorkExperiencesChange,
}: MultiSelectCompanyDropdownProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualCompanyName, setManualCompanyName] = useState("");

  const companies: Company[] = [
    { id: "1", name: "Farout Beach Club" },
    { id: "2", name: "Paradise Holiday" },
    { id: "3", name: "Space Hotel" },
    { id: "4", name: "Ocean Resort" },
    { id: "5", name: "Mountain Lodge" },
  ];

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCompanySelected = (companyId: string) => {
    return selectedCompanies.some((company) => company.id === companyId);
  };

  const toggleCompanySelection = (company: Company) => {
    const isSelected = isCompanySelected(company.id);

    if (isSelected) {
      // Remove company and its work experience
      const updatedCompanies = selectedCompanies.filter(
        (c) => c.id !== company.id
      );
      const updatedExperiences = workExperiences.filter(
        (exp) => exp.companyId !== company.id
      );

      onCompaniesChange(updatedCompanies);
      onWorkExperiencesChange(updatedExperiences);
    } else {
      // Add company and create new work experience
      const updatedCompanies = [...selectedCompanies, company];
      const newExperience: WorkExperience = {
        companyId: company.id,
        companyName: company.name,
        startDate: "",
        endDate: "",
        jobTitle: "",
        isCurrentJob: false,
      };
      const updatedExperiences = [...workExperiences, newExperience];

      onCompaniesChange(updatedCompanies);
      onWorkExperiencesChange(updatedExperiences);
    }
  };

  const addManualCompany = () => {
    if (manualCompanyName.trim()) {
      const newCompany: Company = {
        id: `manual_${Date.now()}`,
        name: manualCompanyName.trim(),
      };

      const updatedCompanies = [...selectedCompanies, newCompany];
      const newExperience: WorkExperience = {
        companyId: newCompany.id,
        companyName: newCompany.name,
        startDate: "",
        endDate: "",
        jobTitle: "",
        isCurrentJob: false,
      };
      const updatedExperiences = [...workExperiences, newExperience];

      onCompaniesChange(updatedCompanies);
      onWorkExperiencesChange(updatedExperiences);
      setManualCompanyName("");
    }
  };

  const updateWorkExperience = (
    companyId: string,
    field: keyof WorkExperience,
    value: any
  ) => {
    const updatedExperiences = workExperiences.map((exp) =>
      exp.companyId === companyId ? { ...exp, [field]: value } : exp
    );
    onWorkExperiencesChange(updatedExperiences);
  };

  const removeCompany = (companyId: string) => {
    const updatedCompanies = selectedCompanies.filter(
      (c) => c.id !== companyId
    );
    const updatedExperiences = workExperiences.filter(
      (exp) => exp.companyId !== companyId
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
            ? `${selectedCompanies.length} Company selected`
            : "Select company name"}
        </Text>
        <Text className="text-gray-400 text-lg">▼</Text>
      </TouchableOpacity>

      {/* Work Experience Forms */}
      {selectedCompanies.length > 0 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedCompanies.map((company, index) => {
            const experience = workExperiences.find(
              (exp) => exp.companyId === company.id
            );
            if (!experience) return null;

            return (
              <View
                key={company.id}
                className="mb-6 bg-white rounded-xl p-4 border border-gray-200"
              >
                {/* Company Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-base font-proximanova-semibold text-gray-900">
                    Company Name {selectedCompanies.length > 1 ? index + 1 : ""}
                  </Text>
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
                    Period
                  </Text>

                  <View className="flex-row gap-3">
                    {/* Start Date */}
                    <View className="flex-1">
                      <DateOfBirthInput
                        value={
                          experience.startDate
                            ? new Date(experience.startDate)
                            : null
                        }
                        onDateChange={(date) =>
                          updateWorkExperience(company.id, "startDate", date)
                        }
                      />
                    </View>

                    {/* End Date */}
                    <View className="flex-1">
                      <DateOfBirthInput
                        value={
                          experience.endDate
                            ? new Date(experience.endDate)
                            : null
                        }
                        onDateChange={(date) =>
                          updateWorkExperience(company.id, "endDate", date)
                        }
                      />
                    </View>
                  </View>
                </View>

                {/* Job Title */}
                <View>
                  <Text className="text-sm font-proximanova-semibold text-gray-900 mb-3">
                    Job Title
                  </Text>
                  <TextInput
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Enter your Role"
                    value={experience.jobTitle}
                    onChangeText={(text) =>
                      updateWorkExperience(company.id, "jobTitle", text)
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
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
              <Text className="text-blue-500 text-lg">Done</Text>
            </TouchableOpacity>
            <Text className="text-lg font-proximanova-semibold text-gray-900">
              Company/Employer
            </Text>
            <View className="w-16" />
          </View>

          {/* Search */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Text className="text-gray-400 mr-3">🔍</Text>
              <TextInput
                className="flex-1 text-sm"
                placeholder="Search here..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Company List */}
          <ScrollView className="flex-1">
            {filteredCompanies.map((company) => (
              <TouchableOpacity
                key={company.id}
                onPress={() => toggleCompanySelection(company)}
                className="flex-row items-center py-4 px-6 border-b border-gray-50"
              >
                {/* Company Avatar */}
                <View className="w-10 h-10 bg-gray-800 rounded-full mr-4 justify-center items-center">
                  <Text className="text-white text-sm font-proximanova-medium">
                    {getCompanyInitials(company.name)}
                  </Text>
                </View>

                {/* Company Name */}
                <Text className="text-base text-gray-900 flex-1">
                  {company.name}
                </Text>

                {/* Selection Indicator */}
                <View
                  className={`w-6 h-6 rounded-full border-2 ${
                    isCompanySelected(company.id)
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
            <View className="p-6 border-t border-gray-200">
              <TouchableOpacity className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-gray-400 rounded-full mr-4 justify-center items-center">
                  <Text className="text-white text-lg">📷</Text>
                </View>
                <Text className="text-base text-gray-900 font-proximanova-medium">
                  Add Company Manually
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center space-x-3">
                <View className="flex-1">
                  <TextInput
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm"
                    placeholder="Type Here..."
                    value={manualCompanyName}
                    onChangeText={setManualCompanyName}
                  />
                </View>
                <TouchableOpacity
                  onPress={addManualCompany}
                  disabled={!manualCompanyName.trim()}
                  className={`px-6 py-3 rounded-xl ${
                    manualCompanyName.trim() ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white font-proximanova-medium">
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default MultiSelectCompanyDropdown;
