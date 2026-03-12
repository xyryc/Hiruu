import type { RecruitmentFilterQuery, RecruitmentShiftType } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { buildRecruitmentQuery } from "@/utils/recruitmentQuery";
import { AxiosError } from "axios";
import { create } from "zustand";
import { useAuthStore } from "./authStore";

type CreateRecruitmentPayload = {
  roleId: string;
  description: string;
  gender: string;
  experience: string;
  shiftType: RecruitmentShiftType;
  jobType: string;
  ageMin: number;
  ageMax: number;
  shiftStartTime: string;
  shiftEndTime: string;
  salaryMin: number;
  salaryMax: number;
  requiredSkills: string[];
  salaryType: "hourly" | "monthly";
  numberOfOpenings: number;
  isFeatured?: boolean;
};

type FeaturedRecruitmentQuery = {
  page?: number;
  limit?: number;
};

type RecruitmentListResponse = {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type RecruitmentApplicationFilterQuery = {
  page?: number;
  limit?: number;
  status?: string;
  recruitmentId?: string;
};

type RecruitmentApplicationItem = {
  id: string;
  recruitmentId?: string;
  userId?: string;
  status?: string;
  source?: "user_applied" | "business_invited" | string;
  invitedById?: string | null;
  respondedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  recruitment?: any;
};

type RecruitmentApplicationListResponse = {
  data: RecruitmentApplicationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
};

type AllJobsFilters = Pick<
  RecruitmentFilterQuery,
  | "shiftType"
  | "jobTypes"
  | "maxSalary"
  | "location"
  | "maxDistanceKm"
  | "sortBy"
  | "search"
  | "page"
  | "limit"
>;

type RecruitmentApplicationSource = "user_applied" | "business_invited";
type RecruitmentApplicationReadScope = "user" | "business";

type GetUnreadCountQuery = {
  scope?: RecruitmentApplicationReadScope;
  businessId?: string;
  type?: RecruitmentApplicationSource;
};

type UnreadCountResponse = {
  user_applied?: number;
  business_invited?: number;
};

const EMPTY_UNREAD_COUNTS: UnreadCountResponse = {
  user_applied: 0,
  business_invited: 0,
};

type MarkAsReadQuery = {
  scope?: RecruitmentApplicationReadScope;
  businessId?: string;
};

type MarkAsReadResponse = {
  updatedCount: number;
  type: RecruitmentApplicationSource;
  scope: RecruitmentApplicationReadScope;
  businessId?: string;
};

type JobProfileFilters = {
  search?: string;
  isPremium?: boolean;
  skills?: string;
  preferredRoleId?: string;
  page?: number;
  limit?: number;
};

type JobProfileListResponse = {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type WeeklyAvailabilityItem = {
  day: string;
  isOpen: boolean;
  startTime?: string;
  endTime?: string;
};

export type JobProfileData = {
  id: string;
  userId: string;
  headline?: string | null;
  about?: string | null;
  isOpenToWork?: boolean;
  preferredRoleIds?: string[];
  highlightedExperience?: string | null;
  preferredSalaryType?: string | null;
  expectedSalaryMin?: number | string | null;
  expectedSalaryMax?: number | string | null;
  weeklyAvailability?: WeeklyAvailabilityItem[];
  skills?: string[];
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
    isOnline?: boolean;
  } | null;
};

interface JobState {
  isLoading: boolean;
  jobProfile: JobProfileData | null;
  isLoadingJobProfile: boolean;
  error: Error | null;
  allJobsFilters: AllJobsFilters;
  setAllJobsFilters: (filters: Partial<AllJobsFilters>) => void;
  clearAllJobsFilters: () => void;
  applyToRecruitment: (recruitmentId: string) => Promise<any>;
  getMyApplications: (
    query?: RecruitmentApplicationFilterQuery
  ) => Promise<RecruitmentApplicationListResponse>;
  getPublicRecruitments: (
    query?: RecruitmentFilterQuery
  ) => Promise<RecruitmentListResponse>;
  getBusinessRecruitments: (
    businessId: string,
    query?: RecruitmentFilterQuery
  ) => Promise<RecruitmentListResponse>;
  getRecruitmentById: (businessId: string, id: string) => Promise<any>;
  shareRecruitment: (businessId: string, id: string) => Promise<any>;
  getFeaturedRecruitments: (
    businessId: string,
    query?: FeaturedRecruitmentQuery
  ) => Promise<RecruitmentListResponse>;
  createRecruitment: (
    businessId: string,
    payload: CreateRecruitmentPayload
  ) => Promise<any>;
  getUnreadCount: (query?: GetUnreadCountQuery) => Promise<UnreadCountResponse>;
  markApplicationsAsRead: (
    type: RecruitmentApplicationSource,
    query?: MarkAsReadQuery
  ) => Promise<MarkAsReadResponse>;
  getMyJobProfile: () => Promise<JobProfileData | null>;
  updateMyJobProfile: (
    payload: Partial<JobProfileData>
  ) => Promise<JobProfileData | null>;
  getJobProfiles: (query?: JobProfileFilters) => Promise<JobProfileListResponse>;
  getBusinessApplications: (
    businessId: string,
    query?: RecruitmentApplicationFilterQuery
  ) => Promise<RecruitmentApplicationListResponse>;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  isLoading: false,
  jobProfile: null,
  isLoadingJobProfile: false,
  error: null,
  allJobsFilters: {},
  setAllJobsFilters: (filters) =>
    set((state) => ({
      allJobsFilters: {
        ...state.allJobsFilters,
        ...filters,
      },
    })),
  clearAllJobsFilters: () => set({ allJobsFilters: { page: 1, limit: 10 } }),

  applyToRecruitment: async (recruitmentId) => {
    try {
      const response = await axiosInstance.post("/recruitment-application", {
        recruitmentId,
      });
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return result?.data || result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to apply for this job";
      throw new Error(message);
    }
  },

  getMyApplications: async (query = {}) => {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      const response = await axiosInstance.get(
        "/recruitment-application/my-applications",
        {
          params: {
            page,
            limit,
            ...(query.status ? { status: query.status } : {}),
            ...(query.recruitmentId ? { recruitmentId: query.recruitmentId } : {}),
          },
        }
      );
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          page: Number(result?.pagination?.page || page),
          limit: Number(result?.pagination?.limit || limit),
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 1),
          hasNext: Boolean(result?.pagination?.hasNext),
          hasPrev: Boolean(result?.pagination?.hasPrev),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch applications";
      throw new Error(message);
    }
  },

  getPublicRecruitments: async (query = {}) => {
    try {
      const params = buildRecruitmentQuery(query);

      const response = await axiosInstance.get("/recruitment/public", {
        params,
      });
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          page: Number(result?.pagination?.page || params.page || 1),
          limit: Number(result?.pagination?.limit || params.limit || 10),
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 1),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch jobs";
      throw new Error(message);
    }
  },

  getBusinessRecruitments: async (businessId, query = {}) => {
    try {
      const params = buildRecruitmentQuery(query);
      const response = await axiosInstance.get(`/recruitment/${businessId}`, {
        params,
      });
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          page: Number(result?.pagination?.page || params.page || 1),
          limit: Number(result?.pagination?.limit || params.limit || 10),
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 1),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch business recruitments";
      throw new Error(message);
    }
  },

  getRecruitmentById: async (businessId, id) => {
    try {
      const response = await axiosInstance.get(`/recruitment/${businessId}/${id}`);
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return result?.data || null;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch recruitment details";
      throw new Error(message);
    }
  },

  shareRecruitment: async (businessId, id) => {
    try {
      const response = await axiosInstance.post(`/recruitment/${businessId}/${id}/share`, {});
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return result?.data || result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to share recruitment";
      throw new Error(message);
    }
  },

  getFeaturedRecruitments: async (businessId, query = {}) => {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      const response = await axiosInstance.get(
        `/recruitment/${businessId}/featured`,
        {
          params: { page, limit },
        }
      );
      const result = response.data;

      if (!result?.statusCode || result.statusCode >= 400) {
        const messageKey = result?.message || "UNKNOWN_ERROR";
        throw new Error(translateApiMessage(messageKey));
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          page: Number(result?.pagination?.page || page),
          limit: Number(result?.pagination?.limit || limit),
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 1),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch featured jobs";
      throw new Error(message);
    }
  },

  createRecruitment: async (businessId, payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post(
        `/recruitment/${businessId}`,
        payload
      );
      const result = response.data;

      if (!result?.success) {
        const messageKey = result?.message || "UNKNOWN_ERROR";
        const validation = Array.isArray(result?.data)
          ? result.data.join("\n")
          : null;
        const message = validation || translateApiMessage(messageKey);
        throw new Error(message);
      }

      set({ isLoading: false });
      return result.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const apiValidation = Array.isArray(axiosError.response?.data?.data)
        ? axiosError.response?.data?.data?.join("\n")
        : null;
      const message =
        apiValidation ||
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to create recruitment";
      const finalError = new Error(message);
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  getUnreadCount: async (query = {}) => {
    const { accessToken, user } = useAuthStore.getState();
    if (!accessToken || !user?.id) {
      return EMPTY_UNREAD_COUNTS;
    }

    try {
      const params: Record<string, string> = {};

      if (query.scope) {
        params.scope = query.scope;
      }
      if (query.businessId) {
        params.businessId = query.businessId;
      }
      if (query.type) {
        params.type = query.type;
      }

      const response = await axiosInstance.get(
        "/recruitment-application/unreads",
        { params }
      );
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return result?.data || EMPTY_UNREAD_COUNTS;
    } catch (error) {
      const { accessToken: latestAccessToken } = useAuthStore.getState();
      if (!latestAccessToken) {
        return EMPTY_UNREAD_COUNTS;
      }

      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch unread count";
      throw new Error(message);
    }
  },

  markApplicationsAsRead: async (type, query = {}) => {
    try {
      const params: Record<string, string> = {};

      if (query.scope) {
        params.scope = query.scope;
      }
      if (query.businessId) {
        params.businessId = query.businessId;
      }

      const response = await axiosInstance.patch(
        `/recruitment-application/read/${type}`,
        {},
        { params }
      );
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return result?.data || { updatedCount: 0, type, scope: query.scope || "user" };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to mark applications as read";
      throw new Error(message);
    }
  },

  getMyJobProfile: async () => {
    set({ isLoadingJobProfile: true, error: null });

    try {
      const response = await axiosInstance.get("/job-profile/me");
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        const message =
          translateApiMessage(result?.message) || "Failed to load job profile";
        throw new Error(message);
      }

      const data = (result?.data ?? null) as JobProfileData | null;
      set({
        jobProfile: data,
        isLoadingJobProfile: false,
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load job profile";
      const finalError = new Error(message);
      set({ isLoadingJobProfile: false, error: finalError });
      throw finalError;
    }
  },

  updateMyJobProfile: async (payload) => {
    set({ isLoadingJobProfile: true, error: null });

    try {
      const response = await axiosInstance.patch("/job-profile/me", payload);
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        const message =
          translateApiMessage(result?.message) || "Failed to update job profile";
        throw new Error(message);
      }

      const data = (result?.data ?? null) as JobProfileData | null;
      set((state) => ({
        jobProfile: data
          ? data
          : state.jobProfile
            ? { ...state.jobProfile, ...payload }
            : null,
        isLoadingJobProfile: false,
      }));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to update job profile";
      const finalError = new Error(message);
      set({ isLoadingJobProfile: false, error: finalError });
      throw finalError;
    }
  },

  getJobProfiles: async (query = {}) => {
    try {
      const params: Record<string, string | number | boolean> = {};

      if (query.page) params.page = query.page;
      if (query.limit) params.limit = query.limit;
      if (query.search) params.search = query.search;
      if (query.skills) params.skills = query.skills;
      if (query.preferredRoleId) params.preferredRoleId = query.preferredRoleId;
      if (query.isPremium !== undefined) params.isPremium = query.isPremium;

      console.log("[JobStore] getJobProfiles called with params:", params);

      const response = await axiosInstance.get("/job-profile/open-to-work", {
        params,
      });
      const result = response.data;

      console.log("[JobStore] getJobProfiles response:", {
        statusCode: result?.statusCode,
        dataLength: Array.isArray(result?.data) ? result.data.length : 0,
        pagination: result?.pagination,
      });

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        console.error("[JobStore] getJobProfiles error:", result?.message);
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          page: Number(result?.pagination?.page || query.page || 1),
          limit: Number(result?.pagination?.limit || query.limit || 20),
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 1),
          hasNext: Boolean(result?.pagination?.hasNext),
          hasPrev: Boolean(result?.pagination?.hasPrev),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error("[JobStore] getJobProfiles exception:", {
        message: axiosError.message,
        response: axiosError.response?.data,
      });
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch job profiles";
      throw new Error(message);
    }
  },

  getBusinessApplications: async (businessId, query = {}) => {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      console.log("[JobStore] getBusinessApplications called:", {
        businessId,
        page,
        limit,
        status: query.status,
        recruitmentId: query.recruitmentId,
      });

      const response = await axiosInstance.get(
        `/recruitment-application/business/${businessId}`,
        {
          params: {
            page,
            limit,
            ...(query.status ? { status: query.status } : {}),
            ...(query.recruitmentId ? { recruitmentId: query.recruitmentId } : {}),
          },
        }
      );
      const result = response.data;

      console.log("[JobStore] getBusinessApplications response:", {
        statusCode: result?.statusCode,
        dataLength: Array.isArray(result?.data) ? result.data.length : 0,
        pagination: result?.pagination,
      });

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        console.error("[JobStore] getBusinessApplications error:", result?.message);
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          page: Number(result?.pagination?.page || page),
          limit: Number(result?.pagination?.limit || limit),
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 1),
          hasNext: Boolean(result?.pagination?.hasNext),
          hasPrev: Boolean(result?.pagination?.hasPrev),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error("[JobStore] getBusinessApplications exception:", {
        message: axiosError.message,
        response: axiosError.response?.data,
      });
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to fetch business applications";
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
