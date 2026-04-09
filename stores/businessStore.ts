import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
};

const isExpectedAuthError = (error: unknown) => {
  const axiosError = error as AxiosError<any>;
  const status = axiosError?.response?.status;
  if (status === 401) return true;

  const message = String((error as any)?.message || "").toLowerCase();
  return (
    message.includes("no refresh token available") ||
    message.includes("token_revoked_or_not_found") ||
    message.includes("unauthorized")
  );
};

interface BusinessState {
  isLoading: boolean;
  isJoiningBusiness: boolean;
  error: Error | null;
  userBusiness?: any;
  myBusinesses: any[];
  myBusinessesLoading: boolean;
  myEmployments: any[];
  myEmploymentsLoading: boolean;
  selectedBusinesses: string[];
  weeklyShiftSelections: Record<string, any[]>;
  weeklyRoleAssignments: Record<string, Record<string, string[]>>;

  fetchBusinesses: (search?: string) => Promise<any>;
  getMyBusinesses: (force?: boolean) => Promise<any>;
  getMyEmployments: (force?: boolean) => Promise<any[]>;
  getRoles: () => Promise<any>;
  getPermissions: () => Promise<any>;
  createBusinessRole: (businessId: string, payload: any) => Promise<any>;
  updateBusinessRole: (
    businessId: string,
    roleId: string,
    payload: any
  ) => Promise<any>;
  getMyBusinessRoles: (businessId: string) => Promise<any>;
  getBusinessRolesDetailed: (businessId: string) => Promise<any[]>;
  getBusinessRoleById: (businessId: string, roleId: string) => Promise<any>;
  assignBusinessRoleToEmployment: (
    businessId: string,
    employmentId: string,
    roleId: string
  ) => Promise<any>;
  createShiftTemplate: (businessId: string, payload: any) => Promise<any>;
  updateShiftTemplate: (
    businessId: string,
    templateId: string,
    payload: any
  ) => Promise<any>;
  getShiftTemplates: (businessId: string) => Promise<any>;
  createWeeklyScheduleFromTemplates: (
    businessId: string,
    payload: any
  ) => Promise<any>;
  createHoliday: (businessId: string, payload: any) => Promise<any>;
  importPublicHolidays: (
    businessId: string,
    payload: { country: string }
  ) => Promise<any>;
  getBusinessHolidays: (
    businessId: string,
    params?: { dateFrom?: string; dateTo?: string }
  ) => Promise<any[]>;
  deleteHoliday: (businessId: string, holidayId: string) => Promise<any>;
  createWeeklyScheduleBlock: (businessId: string, payload: any) => Promise<any>;
  updateWeeklyScheduleBlock: (
    businessId: string,
    blockId: string,
    payload: any
  ) => Promise<any>;
  deleteWeeklyScheduleBlock: (businessId: string, blockId: string) => Promise<any>;
  getWeeklyScheduleBlocks: (businessId: string) => Promise<any[]>;
  getWeeklyScheduleBlockById: (businessId: string, blockId: string) => Promise<any>;
  getShiftTemplateById: (businessId: string, templateId: string) => Promise<any>;
  deleteShiftTemplate: (businessId: string, templateId: string) => Promise<any>;
  getBusinessProfile: (businessId: string) => Promise<any>;
  getBusinessOverview: (businessId: string) => Promise<{
    businessSummary?: any;
    todaysShiftSummary?: any;
    todaysAttendance?: any;
    teamInsights?: {
      totalEmployees?: number;
      onLeaveToday?: number;
      ratingsRecent?: {
        average?: number;
        ratingsCount?: number;
      };
    };
  } | null>;
  getBusinessPerformanceTrends: (
    businessId: string,
    graphType?: "daily" | "monthly" | "yearly"
  ) => Promise<{
    period?: {
      graphType?: string;
      timezone?: string;
      from?: string;
      to?: string;
    };
    summary?: {
      completedShifts?: number;
      missedShifts?: number;
      completedShiftPercentage?: number;
      missedShiftPercentage?: number;
    };
    series?: Array<{
      key: string;
      label: string;
      completedShifts?: number;
      missedShifts?: number;
    }>;
  } | null>;
  getPublicBusinessProfile: (businessId: string) => Promise<any>;
  getBusinessEmployees: (businessId: string) => Promise<any[]>;
  updateMyBusinessProfile: (businessId: string, payload: any) => Promise<any>;
  deleteBusinessRole: (businessId: string, roleId: string) => Promise<any>;
  setSelectedBusinesses: (ids: string[]) => void;
  setWeeklyShiftSelection: (day: string, templates: any[]) => void;
  clearWeeklyShiftSelections: () => void;
  setWeeklyRoleAssignment: (
    key: string,
    assignments: Record<string, string[]>
  ) => void;
  clearWeeklyRoleAssignments: () => void;
  createCompanyManual: (companyData: any) => Promise<any>;
  createBusinessProfile: (payload: any) => Promise<any>;
  generateBusinessCode: (businessId: string) => Promise<any>;
  joinBusiness: (invitationCode: string) => Promise<any>;
  resetBusinessSession: () => void;
  clearError: () => void;
}

const appendAddressToFormData = (formData: FormData, address: any) => {
  if (!address || typeof address !== "object") {
    return;
  }

  if (typeof address.address === "string" && address.address.trim()) {
    formData.append("address[address]", address.address.trim());
  }
  if (typeof address.latitude === "number") {
    formData.append("address[latitude]", String(address.latitude));
  }
  if (typeof address.longitude === "number") {
    formData.append("address[longitude]", String(address.longitude));
  }
  if (typeof address.placeId === "string" && address.placeId) {
    formData.append("address[placeId]", address.placeId);
  }
  if (typeof address.city === "string" && address.city) {
    formData.append("address[city]", address.city);
  }
  if (typeof address.state === "string" && address.state) {
    formData.append("address[state]", address.state);
  }
  if (typeof address.country === "string" && address.country) {
    formData.append("address[country]", address.country);
  }
};

const appendSocialToFormData = (formData: FormData, social: any) => {
  if (!social || typeof social !== "object") return;

  const keys = ["facebook", "linkedin", "whatsapp", "twitter", "telegram", "instagram"];
  keys.forEach((key) => {
    const value = social[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;
      formData.append(`social[${key}]`, trimmed);
    }
  });
};

const normalizeSocialPayload = (social: any) => {
  if (!social || typeof social !== "object") return undefined;

  const keys = ["facebook", "linkedin", "whatsapp", "twitter", "telegram", "instagram"];
  const next: Record<string, string> = {};

  keys.forEach((key) => {
    const value = social[key];
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    next[key] = trimmed;
  });

  return Object.keys(next).length ? next : undefined;
};

const normalizeAddressPayload = (address: any) => {
  if (!address || typeof address !== "object") return undefined;
  if (typeof address.address !== "string" || !address.address.trim()) {
    return undefined;
  }
  const latitude =
    typeof address.latitude === "number" ? address.latitude : undefined;
  const longitude =
    typeof address.longitude === "number" ? address.longitude : undefined;

  return {
    address: address.address.trim(),
    latitude,
    longitude,
    placeId: address.placeId,
    city: address.city,
    state: address.state,
    country: address.country,
  };
};

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      isJoiningBusiness: false,
      error: null,
      userBusiness: null,
      myBusinesses: [],
      myBusinessesLoading: false,
      myEmployments: [],
      myEmploymentsLoading: false,
      selectedBusinesses: [],
      weeklyShiftSelections: {},
      weeklyRoleAssignments: {},

  setSelectedBusinesses: (ids) => set({ selectedBusinesses: ids }),
  setWeeklyShiftSelection: (day, templates) =>
    set((state) => ({
      weeklyShiftSelections: {
        ...state.weeklyShiftSelections,
        [day]: Array.isArray(templates) ? templates : [],
      },
    })),
  clearWeeklyShiftSelections: () => set({ weeklyShiftSelections: {} }),
  setWeeklyRoleAssignment: (key, assignments) =>
    set((state) => ({
      weeklyRoleAssignments: {
        ...state.weeklyRoleAssignments,
        [key]: assignments,
      },
    })),
  clearWeeklyRoleAssignments: () => set({ weeklyRoleAssignments: {} }),

  fetchBusinesses: async (search = "") => {
    try {
      const query = search.trim();
      const response = await axiosInstance.get("/companies", {
        params: query ? { search: query } : undefined,
      });

      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch businesses";
        throw new Error(errorMsg);
      }

      const companies = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.data)
          ? result.data.data
          : [];

      return companies;
    } catch (error) {
      console.error("Fetch businesses error:", error);
      throw error;
    }
  },

  getMyBusinesses: async (force = false) => {
    try {
      const { myBusinesses } = get();
      if (!force && myBusinesses.length > 0) {
        return myBusinesses;
      }

      set({ myBusinessesLoading: true });
      const response = await axiosInstance.get("/business/my-businesses");
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch businesses";
        throw new Error(errorMsg);
      }

      set({
        myBusinesses: result.data || [],
        myBusinessesLoading: false,
      });

      return result.data;
    } catch (error) {
      set({ myBusinessesLoading: false });
      console.error("Fetch my businesses error:", error);
      throw error;
    }
  },

  getRoles: async () => {
    try {
      const response = await axiosInstance.get("/roles");
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message || result.message?.code || "Failed to fetch roles";
        throw new Error(errorMsg);
      }

      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Fetch predefined roles error:", error);
      throw error;
    }
  },

  getPermissions: async () => {
    try {
      const response = await axiosInstance.get("/permissions");
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch permissions";
        throw new Error(errorMsg);
      }

      return result.data || {};
    } catch (error) {
      console.error("Fetch permissions error:", error);
      throw error;
    }
  },

  createBusinessRole: async (businessId, payload) => {
    try {
      const response = await axiosInstance.post(
        `/businesses/${businessId}/roles`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to create business role";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Create business role error:", error);
      throw error;
    }
  },

  updateBusinessRole: async (businessId, roleId, payload) => {
    try {
      const response = await axiosInstance.patch(
        `/businesses/${businessId}/roles/${roleId}`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to update business role";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Update business role error:", error);
      throw error;
    }
  },

  getMyBusinessRoles: async (businessId) => {
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/roles`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch roles";
        throw new Error(errorMsg);
      }

      return result.data || [];
    } catch (error) {
      console.error("Fetch roles error:", error);
      throw error;
    }
  },

  getBusinessRolesDetailed: async (businessId) => {
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/roles/detailed`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch detailed roles";
        throw new Error(errorMsg);
      }

      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Fetch detailed business roles error:", error);
      throw error;
    }
  },

  getBusinessRoleById: async (businessId, roleId) => {
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/roles/${roleId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch role details";
        throw new Error(errorMsg);
      }

      return result.data || null;
    } catch (error) {
      console.error("Fetch role details error:", error);
      throw error;
    }
  },

  createShiftTemplate: async (businessId, payload) => {
    try {
      const response = await axiosInstance.post(
        `/shift-template/${businessId}`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to create shift template";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Create shift template error:", error);
      throw error;
    }
  },

  getShiftTemplates: async (businessId) => {
    try {
      const response = await axiosInstance.get(`/shift-template/${businessId}`);
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch shift templates";
        throw new Error(errorMsg);
      }

      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Fetch shift templates error:", error);
      throw error;
    }
  },

  createWeeklyScheduleFromTemplates: async (businessId, payload) => {
    try {
      const response = await axiosInstance.post(
        `/weekly-schedule/${businessId}/templates`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to create weekly schedule";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Create weekly schedule from templates error:", error);
      throw error;
    }
  },

  createHoliday: async (businessId, payload) => {
    try {
      const response = await axiosInstance.post(
        `/holidays/business/${businessId}`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to create holiday";
        throw new Error(errorMsg);
      }

      return result;
    } catch (error) {
      console.error("Create holiday error:", error);
      throw error;
    }
  },

  importPublicHolidays: async (businessId, payload) => {
    try {
      console.log(
        "[BusinessStore] importPublicHolidays request:",
        JSON.stringify({ businessId, ...payload }, null, 2)
      );
      const response = await axiosInstance.post(
        `/holidays/business/${businessId}/import-public`,
        payload
      );
      const result = response.data;
      console.log(
        "[BusinessStore] importPublicHolidays response:",
        JSON.stringify(result, null, 2)
      );

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to import public holidays";
        throw new Error(errorMsg);
      }

      return result;
    } catch (error: any) {
      console.error(
        "Import public holidays error:",
        JSON.stringify(
          {
            message: error?.message,
            response: error?.response?.data,
          },
          null,
          2
        )
      );
      throw error;
    }
  },

  getBusinessHolidays: async (businessId, params) => {
    try {
      const response = await axiosInstance.get(`/holidays/business/${businessId}`, {
        params,
      });
      const result = response.data;
      console.log(
        "[BusinessStore] getBusinessHolidays response:",
        JSON.stringify(result, null, 2)
      );

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch holidays";
        throw new Error(errorMsg);
      }

      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Fetch holidays error:", error);
      throw error;
    }
  },

  deleteHoliday: async (businessId, holidayId) => {
    try {
      const response = await axiosInstance.delete(
        `/holidays/${holidayId}/business/${businessId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to delete holiday";
        throw new Error(errorMsg);
      }

      return result;
    } catch (error) {
      console.error("Delete holiday error:", error);
      throw error;
    }
  },

  createWeeklyScheduleBlock: async (businessId, payload) => {
    try {
      const response = await axiosInstance.post(
        `/weekly-schedule/${businessId}/blocks`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to create weekly block";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Create weekly schedule block error:", error);
      throw error;
    }
  },

  updateWeeklyScheduleBlock: async (businessId, blockId, payload) => {
    try {
      const response = await axiosInstance.patch(
        `/weekly-schedule/${businessId}/blocks/${blockId}`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to update weekly block";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Update weekly schedule block error:", error);
      throw error;
    }
  },

  deleteWeeklyScheduleBlock: async (businessId, blockId) => {
    try {
      const response = await axiosInstance.delete(
        `/weekly-schedule/${businessId}/blocks/${blockId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to delete weekly block";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Delete weekly schedule block error:", error);
      throw error;
    }
  },

  getWeeklyScheduleBlocks: async (businessId) => {
    try {
      const response = await axiosInstance.get(`/weekly-schedule/${businessId}/blocks`);
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch weekly blocks";
        throw new Error(errorMsg);
      }

      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Fetch weekly schedule blocks error:", error);
      throw error;
    }
  },

  getWeeklyScheduleBlockById: async (businessId, blockId) => {
    try {
      const response = await axiosInstance.get(
        `/weekly-schedule/${businessId}/blocks/${blockId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch weekly block";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Fetch weekly schedule block by id error:", error);
      throw error;
    }
  },

  updateShiftTemplate: async (businessId, templateId, payload) => {
    try {
      const response = await axiosInstance.patch(
        `/shift-template/${businessId}/${templateId}`,
        payload
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to update shift template";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Update shift template error:", error);
      throw error;
    }
  },

  getShiftTemplateById: async (businessId, templateId) => {
    try {
      const response = await axiosInstance.get(
        `/shift-template/${businessId}/${templateId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch shift template";
        throw new Error(errorMsg);
      }

      return result.data || null;
    } catch (error) {
      console.error("Fetch shift template by id error:", error);
      throw error;
    }
  },

  deleteShiftTemplate: async (businessId, templateId) => {
    try {
      const response = await axiosInstance.delete(
        `/shift-template/${businessId}/${templateId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to delete shift template";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const messageKey =
        (Array.isArray(axiosError.response?.data?.data) &&
          axiosError.response?.data?.data[0]) ||
        axiosError.response?.data?.message ||
        "Failed to delete shift template";
      const message = translateApiMessage(messageKey);
      const finalError = new Error(message);
      console.error("Delete shift template error:", finalError);
      throw finalError;
    }
  },

  getBusinessProfile: async (businessId) => {
    try {
      const response = await axiosInstance.get(`/business/${businessId}`);
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch business profile";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Fetch business profile error:", error);
      throw error;
    }
  },

  getMyEmployments: async (force = false) => {
    try {
      const { myEmployments } = get();
      if (!force && myEmployments.length > 0) {
        return myEmployments;
      }

      set({ myEmploymentsLoading: true });
      const response = await axiosInstance.get("/employment/my-employments");
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch employments";
        throw new Error(errorMsg);
      }

      const employments = Array.isArray(result?.data) ? result.data : [];
      set({
        myEmployments: employments,
        myEmploymentsLoading: false,
      });

      return employments;
    } catch (error) {
      set({ myEmploymentsLoading: false });
      if (isExpectedAuthError(error)) {
        set({ myEmployments: [] });
        return [];
      }
      console.error("Fetch my employments error:", error);
      throw error;
    }
  },

  getBusinessOverview: async (businessId) => {
    try {
      if (!businessId) return null;

      const response = await axiosInstance.get(
        `/analytics/business/${businessId}/overview`
      );
      const result = response.data;

      if (!result?.success) {
        const errorMsg =
          result?.error?.message ||
          result?.message ||
          "Failed to fetch business overview";
        throw new Error(errorMsg);
      }

      return result?.data || null;
    } catch (error: any) {
      const axiosError = error as AxiosError<any>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        "Failed to fetch business overview";
      throw new Error(errorMessage);
    }
  },

  getBusinessPerformanceTrends: async (businessId, graphType = "daily") => {
    try {
      if (!businessId) return null;

      const response = await axiosInstance.get(
        `/analytics/business/${businessId}/performance-trends`,
        {
          params: { graphType },
        }
      );
      const result = response.data;

      if (!result?.success) {
        const errorMsg =
          result?.error?.message ||
          result?.message ||
          "Failed to fetch performance trends";
        throw new Error(errorMsg);
      }

      return result?.data || null;
    } catch (error: any) {
      const axiosError = error as AxiosError<any>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        "Failed to fetch performance trends";
      throw new Error(errorMessage);
    }
  },

  getPublicBusinessProfile: async (businessId) => {
    try {
      const response = await axiosInstance.get(`/business/public/${businessId}`);
      const result = response.data;
      console.log(
        "[BusinessStore] getPublicBusinessProfile response:",
        JSON.stringify(result, null, 2)
      );

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch public business profile";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Fetch public business profile error:", error);
      throw error;
    }
  },

  deleteBusinessRole: async (businessId, roleId) => {
    try {
      const response = await axiosInstance.delete(
        `/businesses/${businessId}/roles/${roleId}`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to delete role";
        throw new Error(errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  },

  updateMyBusinessProfile: async (businessId, payload) => {
    set({ isLoading: true, error: null });

    try {
      const hasFile = Boolean(payload.logo || payload.coverPhoto);
      let result: any = null;

      if (!hasFile) {
        const normalizedPayload = {
          ...payload,
          address: normalizeAddressPayload(payload.address),
          social: normalizeSocialPayload(payload.social),
        };
        const response = await axiosInstance.patch(
          `/business/${businessId}`,
          normalizedPayload
        );
        result = response.data;

        if (!result?.success) {
          const messageKey = result?.message || "UNKNOWN_ERROR";
          const validation = Array.isArray(result?.data)
            ? result.data.join("\n")
            : null;
          const message = validation || translateApiMessage(messageKey);
          throw new Error(message);
        }
      } else {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error("API URL not configured");
        }

        const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const formData = new FormData();

        if (payload.name) formData.append("name", payload.name);
        if (payload.description) formData.append("description", payload.description);
        appendAddressToFormData(formData, payload.address);
        appendSocialToFormData(formData, payload.social);
        if (typeof payload.isRecruiting === "boolean") {
          formData.append("isRecruiting", String(payload.isRecruiting));
        }

        if (payload.logo) {
          const logoFile = {
            uri: payload.logo,
            type: "image/jpeg",
            name: "logo.jpg",
          } as any;
          formData.append("logo", logoFile);
        }

        if (payload.coverPhoto) {
          const coverFile = {
            uri: payload.coverPhoto,
            type: "image/jpeg",
            name: "cover.jpg",
          } as any;
          formData.append("coverPhoto", coverFile);
        }

        const response = await fetch(`${baseUrl}/business/${businessId}`, {
          method: "PATCH",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          body: formData,
        });

        const rawText = await response.text();
        try {
          result = rawText ? JSON.parse(rawText) : null;
        } catch {
          result = null;
        }

        if (!response.ok || !result?.success) {
          const messageKey = result?.message || "UNKNOWN_ERROR";
          const validation = Array.isArray(result?.data)
            ? result.data.join("\n")
            : null;
          const message = validation || translateApiMessage(messageKey);
          throw new Error(message);
        }
      }

      const updatedBusiness = result.data ?? null;
      set((state) => ({
        userBusiness: updatedBusiness ?? state.userBusiness,
        myBusinesses: updatedBusiness
          ? state.myBusinesses.map((item) =>
            item?.id === updatedBusiness?.id ? updatedBusiness : item
          )
          : state.myBusinesses,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const finalError =
        error instanceof Error ? error : new Error("Failed to update business");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  createCompanyManual: async (companyData) => {
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();

      if (companyData.companyName) {
        formData.append("name", companyData.companyName);
      }

      if (companyData.logo && companyData.logo.uri) {
        formData.append("logo", companyData.logo as any);
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("API URL not configured");
      }

      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${baseUrl}/companies`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to add company");
      }

      set({ isLoading: false });

      return result.data ?? result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        translateApiMessage("UNKNOWN_ERROR");
      const finalError = new Error(errorMessage);

      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  createBusinessProfile: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("API URL not configured");
      }

      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const formData = new FormData();
      if (payload.name) formData.append("name", payload.name);
      if (payload.description) formData.append("description", payload.description);
      appendAddressToFormData(formData, payload.address);
      if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
      if (payload.countryCode) formData.append("countryCode", payload.countryCode);
      if (payload.email) formData.append("email", payload.email);
      if (payload.website) formData.append("website", payload.website);
      appendSocialToFormData(formData, payload.social);

      if (payload.logo) {
        const logoFile = {
          uri: payload.logo,
          type: "image/jpeg",
          name: "logo.jpg",
        } as any;
        formData.append("logo", logoFile);
      }

      if (payload.coverPhoto) {
        const coverFile = {
          uri: payload.coverPhoto,
          type: "image/jpeg",
          name: "cover.jpg",
        } as any;
        formData.append("coverPhoto", coverFile);
      }

      const response = await fetch(`${baseUrl}/business`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });

      const rawText = await response.text();
      let result: any = null;
      try {
        result = rawText ? JSON.parse(rawText) : null;
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        const messageKey = result?.message || "UNKNOWN_ERROR";
        const validation = Array.isArray(result?.data)
          ? result.data.join("\n")
          : null;
        const message = validation || translateApiMessage(messageKey);
        console.error("Create business failed:", {
          status: response.status,
          body: rawText,
        });
        throw new Error(message);
      }

      set({
        userBusiness: result.data ?? null,
        isLoading: false,
        myBusinesses: result?.data
          ? [
            result.data,
            ...get().myBusinesses.filter(
              (item) => item?.id !== result.data?.id
            ),
          ]
          : get().myBusinesses,
      });

      return result;
    } catch (error) {
      const finalError =
        error instanceof Error ? error : new Error("Failed to create business");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  generateBusinessCode: async (businessId) => {
    try {
      set({ isJoiningBusiness: true, error: null });
      const response = await axiosInstance.post(
        `/employment/businesses/${businessId}/invitations`
      );

      const result = response.data;
      set({ isJoiningBusiness: false });

      return result.data;
    } catch (err: any) {
      const axiosError = err as AxiosError<any>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Something went wrong";

      set({
        isJoiningBusiness: false,
        error: new Error(errorMessage),
      });
      throw new Error(errorMessage);
    }
  },

  joinBusiness: async (invitationCode) => {
    try {
      set({ isJoiningBusiness: true, error: null });
      const response = await axiosInstance.post("/employment/join", {
        invitationCode,
      });

      const result = response.data;

      set({ isJoiningBusiness: false });

      return result.data;
    } catch (err: any) {
      const axiosError = err as AxiosError<any>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Something went wrong";

      set({
        isJoiningBusiness: false,
        error: new Error(errorMessage),
      });
      throw new Error(errorMessage);
    }
  },

  assignBusinessRoleToEmployment: async (businessId, employmentId, roleId) => {
    try {
      const response = await axiosInstance.post(
        `/businesses/${businessId}/roles/assign/${employmentId}`,
        { roleId }
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result?.message ||
          result?.error?.message ||
          "Failed to assign business role";
        throw new Error(errorMsg);
      }

      return result;
    } catch (error: any) {
      const axiosError = error as AxiosError<any>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        "Failed to assign business role";

      console.error("Assign business role error:", error);
      throw new Error(errorMessage);
    }
  },

  getBusinessEmployees: async (businessId) => {
    try {
      const response = await axiosInstance.get(
        `/employment/businesses/${businessId}/employees`
      );
      const result = response.data;

      if (!result.success) {
        const errorMsg =
          result.error?.message ||
          result.message?.code ||
          "Failed to fetch employees";
        throw new Error(errorMsg);
      }

      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Fetch business employees error:", error);
      throw error;
    }
  },

  resetBusinessSession: () =>
    set({
      userBusiness: null,
      myBusinesses: [],
      myEmployments: [],
      selectedBusinesses: [],
      myBusinessesLoading: false,
      myEmploymentsLoading: false,
      isJoiningBusiness: false,
      error: null,
      weeklyShiftSelections: {},
      weeklyRoleAssignments: {},
    }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "business-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedBusinesses: state.selectedBusinesses,
      }),
    }
  )
);
