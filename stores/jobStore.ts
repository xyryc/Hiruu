import type { MyEmploymentItem, RecruitmentFilterQuery, RecruitmentShiftType } from "@/types";
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

type UpdateRecruitmentPayload = CreateRecruitmentPayload;

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

type RecruitmentApplicationStatus = "approved" | "rejected" | "pending";

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

type BusinessInvitePayload = {
  userId: string;
  roleId: string;
  minSalary: number;
  maxSalary: number;
};

type AllJobsFilters = Pick<
  RecruitmentFilterQuery,
  | "shiftTypes"
  | "jobTypes"
  | "maxSalary"
  | "experienceRequirements"
  | "location"
  | "latitude"
  | "longitude"
  | "maxDistanceKm"
  | "sortBy"
  | "search"
  | "isFeatured"
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

const withApiV1Prefix = (path: string) => {
  // axiosInstance.baseURL is configured from EXPO_PUBLIC_API_URL.
  // In some environments it's already ".../api/v1" (then we must NOT prefix again),
  // while in others it may be just the domain (then we DO need "/api/v1").
  const base = String(axiosInstance.defaults.baseURL || "").replace(/\/$/, "");
  const needsPrefix = base.length > 0 && !/\/api\/v1$/i.test(base);
  return `${needsPrefix ? "/api/v1" : ""}${path}`;
};

const buildJobProfilesParams = (query: any) => {
  const params: Record<string, string | number | boolean> = {};

  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.search) params.search = query.search;
  if (query.skills) params.skills = query.skills;
  if (query.preferredRoleId) params.preferredRoleId = query.preferredRoleId;
  if (query.role) params.role = query.role;
  if (query.verifiedOnly !== undefined) params.verifiedOnly = query.verifiedOnly;
  if (query.isFeatured !== undefined) params.isFeatured = query.isFeatured;
  if (query.isPremium !== undefined && typeof params.isFeatured === "undefined") {
    params.isFeatured = query.isPremium;
  }
  if (query.location) params.location = query.location;
  if (query.latitude !== undefined) params.latitude = query.latitude;
  if (query.longitude !== undefined) params.longitude = query.longitude;
  if (query.postcode) params.postcode = query.postcode;
  if (query.maxDistanceKm !== undefined) params.maxDistanceKm = query.maxDistanceKm;
  if (query.salaryMin !== undefined) params.salaryMin = query.salaryMin;
  if (query.salaryMax !== undefined) params.salaryMax = query.salaryMax;
  if (query.availabilityTypes) {
    params.availabilityTypes = Array.isArray(query.availabilityTypes)
      ? query.availabilityTypes.join(",")
      : query.availabilityTypes;
  }
  if (query.shiftTypes) {
    params.shiftTypes = Array.isArray(query.shiftTypes)
      ? query.shiftTypes.join(",")
      : query.shiftTypes;
  }
  if (query.availableDays) {
    params.availableDays = Array.isArray(query.availableDays)
      ? query.availableDays.join(",")
      : query.availableDays;
  }
  if (query.experienceRequirements && query.experienceRequirements.length > 0) {
    params.experienceRequirements = JSON.stringify(query.experienceRequirements);
  }
  if (query.workingDaySlots && query.workingDaySlots.length > 0) {
    params.workingDaySlots = JSON.stringify(query.workingDaySlots);
  }
  if (query.sortBy) params.sortBy = query.sortBy;

  return params;
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
  isFeatured?: boolean;
  skills?: string;
  preferredRoleId?: string;
  preferredRoleIds?: string[] | string;
  role?: string;
  verifiedOnly?: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  postcode?: string;
  maxDistanceKm?: number;
  salaryMin?: number;
  salaryMax?: number;
  availabilityTypes?: string[] | string;
  shiftTypes?: string[] | string;
  availableDays?: string[] | string;
  experienceRequirements?: { roleId?: string; role?: string; minYears: number }[];
  workingDaySlots?: { day: string; startTime: string; endTime: string }[];
  sortBy?: "newest" | "highest_rating" | "most_experience" | "best_fit";
  page?: number;
  limit?: number;
};

type BusinessCandidateFilters = Omit<JobProfileFilters, "page" | "limit" | "isPremium" | "isFeatured"> & {
  verifiedOnly?: boolean;
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
  myEmployments: MyEmploymentItem[];
  selectedEmploymentBusinessIds: string[];
  myEmploymentsLoading: boolean;
  myEmploymentsError: string | null;
  error: Error | null;
  allJobsFilters: AllJobsFilters;
  businessCandidateFilters: BusinessCandidateFilters;
  setAllJobsFilters: (filters: Partial<AllJobsFilters>) => void;
  clearAllJobsFilters: () => void;
  setBusinessCandidateFilters: (
    filters: Partial<BusinessCandidateFilters>
  ) => void;
  clearBusinessCandidateFilters: () => void;
  applyToRecruitment: (recruitmentId: string) => Promise<any>;
  inviteCandidateToRecruitment: (
    businessId: string,
    payload: BusinessInvitePayload
  ) => Promise<any>;
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
  updateRecruitment: (
    businessId: string,
    id: string,
    payload: UpdateRecruitmentPayload
  ) => Promise<any>;
  deleteRecruitment: (businessId: string, id: string) => Promise<any>;
  getUnreadCount: (query?: GetUnreadCountQuery) => Promise<UnreadCountResponse>;
  markApplicationsAsRead: (
    type: RecruitmentApplicationSource,
    query?: MarkAsReadQuery
  ) => Promise<MarkAsReadResponse>;
  getMyJobProfile: () => Promise<JobProfileData | null>;
  getJobProfileByUserId: (userId: string) => Promise<JobProfileData | null>;
  updateMyJobProfile: (
    payload: Partial<JobProfileData>
  ) => Promise<JobProfileData | null>;
  getJobProfiles: (query?: JobProfileFilters) => Promise<JobProfileListResponse>;
  getJobProfilesForBusiness: (
    businessId: string,
    query?: JobProfileFilters
  ) => Promise<JobProfileListResponse>;
  getBusinessApplications: (
    businessId: string,
    query?: RecruitmentApplicationFilterQuery
  ) => Promise<RecruitmentApplicationListResponse>;
  updateBusinessApplicationStatus: (
    businessId: string,
    id: string,
    status: RecruitmentApplicationStatus
  ) => Promise<any>;
  getMyEmployments: () => Promise<MyEmploymentItem[]>;
  setSelectedEmploymentBusinessIds: (ids: string[]) => void;
  clearMyEmploymentsError: () => void;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  isLoading: false,
  jobProfile: null,
  isLoadingJobProfile: false,
  myEmployments: [],
  selectedEmploymentBusinessIds: [],
  myEmploymentsLoading: false,
  myEmploymentsError: null,
  error: null,
  allJobsFilters: {},
  businessCandidateFilters: {},
  setAllJobsFilters: (filters) =>
    set((state) => ({
      allJobsFilters: {
        ...state.allJobsFilters,
        ...filters,
      },
    })),
  clearAllJobsFilters: () => set({ allJobsFilters: { page: 1, limit: 10 } }),
  setBusinessCandidateFilters: (filters) =>
    set((state) => ({
      businessCandidateFilters: {
        ...state.businessCandidateFilters,
        ...filters,
      },
    })),
  clearBusinessCandidateFilters: () => set({ businessCandidateFilters: {} }),

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

  inviteCandidateToRecruitment: async (businessId, payload) => {
    try {
      const response = await axiosInstance.post(
        `/recruitment-application/business/${businessId}/invite`,
        payload
      );
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
        "Failed to invite candidate";
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

  updateRecruitment: async (businessId, id, payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.patch(
        `/recruitment/${businessId}/${id}`,
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
        "Failed to update recruitment";
      const finalError = new Error(message);
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  deleteRecruitment: async (businessId, id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.delete(`/recruitment/${businessId}/${id}`);
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        const message =
          translateApiMessage(result?.message) || "Failed to delete recruitment";
        throw new Error(message);
      }

      set({ isLoading: false });
      return result?.data || result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to delete recruitment";
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

      const response = await axiosInstance.get("/recruitment-application/unreads", {
        params,
        skipErrorLog: true,
      } as any);
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
      if (!axiosError.response) {
        return EMPTY_UNREAD_COUNTS;
      }
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

  getJobProfileByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/job-profile/${userId}`);
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        const message =
          translateApiMessage(result?.message) || "Failed to load job profile";
        throw new Error(message);
      }

      return (result?.data ?? null) as JobProfileData | null;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load job profile";
      throw new Error(message);
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
          ? state.jobProfile
            ? { ...state.jobProfile, ...data }
            : data
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
      const params = buildJobProfilesParams(query);
      const response = await axiosInstance.get("/job-profile/open-to-work", {
        params,
      });
      const result = response.data;

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

  getJobProfilesForBusiness: async (businessId, query = {}) => {
    try {
      if (!businessId || String(businessId).trim().length === 0) {
        throw new Error("BUSINESS_ID_REQUIRED");
      }

      const params = buildJobProfilesParams(query);
      const url = withApiV1Prefix(`/job-profile/${businessId}/open-to-work`);
      const response = await axiosInstance.get(url, { params });
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        console.error("[JobStore] getJobProfilesForBusiness error:", result?.message);
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
      console.error("[JobStore] getJobProfilesForBusiness exception:", {
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

  updateBusinessApplicationStatus: async (businessId, id, status) => {
    try {
      const response = await axiosInstance.patch(
        `/recruitment-application/business/${businessId}/${id}`,
        { status }
      );
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
        "Failed to update application status";
      throw new Error(message);
    }
  },

  getMyEmployments: async () => {
    try {
      set({ myEmploymentsLoading: true, myEmploymentsError: null });
      const response = await axiosInstance.get("/employment/my-employments");
      const result = response.data;

      const hasError =
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400);
      if (hasError) {
        throw new Error(translateApiMessage(result?.message || "UNKNOWN_ERROR"));
      }

      const employments = Array.isArray(result?.data) ? result.data : [];
      const validBusinessIds = new Set(
        employments
          .map((item: MyEmploymentItem) => item?.business?.id || item?.businessId)
          .filter(Boolean) as string[]
      );
      set((state) => ({
        myEmployments: employments,
        selectedEmploymentBusinessIds: state.selectedEmploymentBusinessIds.filter((id) =>
          validBusinessIds.has(id)
        ),
        myEmploymentsLoading: false,
      }));
      return employments;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load businesses";
      set({
        myEmployments: [],
        myEmploymentsLoading: false,
        myEmploymentsError: message,
      });
      throw new Error(message);
    }
  },

  setSelectedEmploymentBusinessIds: (ids) =>
    set(() => {
      const unique = Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));
      // Keep selection mode constrained to [] (all) or [single business].
      return {
        selectedEmploymentBusinessIds: unique.length > 1 ? [unique[0]] : unique,
      };
    }),

  clearMyEmploymentsError: () => set({ myEmploymentsError: null }),

  clearError: () => set({ error: null }),
}));
