import axiosInstance from "@/utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type BusinessColleagueItem = {
  employmentId: string;
  userId: string;
  user?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
  role?: {
    id?: string;
    systemRoleId?: string;
    name?: string;
  } | null;
};

type ShiftStoreState = {
  myShifts: any[];
  myShiftsLoading: boolean;
  myShiftsError: string | null;
  myShiftsMeta: {
    nextShiftAt?: string | null;
  } | null;
  homeShifts: any[];
  homeShiftsLoading: boolean;
  homeShiftsError: string | null;
  homeShiftsMeta: {
    nextShiftAt?: string | null;
  } | null;
  businessAssignments: any[];
  businessAssignmentsLoading: boolean;
  businessAssignmentsError: string | null;
  businessAssignmentsMeta: {
    nextShiftDate?: string | null;
  } | null;
  businessAssignmentsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  shiftRequests: any[];
  shiftRequestsLoading: boolean;
  shiftRequestsError: string | null;
  shiftRequestsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  businessShiftRequests: any[];
  businessShiftRequestsLoading: boolean;
  businessShiftRequestsError: string | null;
  businessShiftRequestsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  shiftAssignmentDetails: any | null;
  shiftAssignmentDetailsLoading: boolean;
  shiftAssignmentDetailsError: string | null;
  createShiftRequestLoading: boolean;
  createShiftRequestError: string | null;
  approveShiftRequestLoading: boolean;
  approveShiftRequestError: string | null;
  rejectShiftRequestLoading: boolean;
  rejectShiftRequestError: string | null;
  createShiftReportLoading: boolean;
  createShiftReportError: string | null;
  getTrackHoursAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
  }) => Promise<{
    status?: string;
    period?: {
      startDate?: string;
      endDate?: string;
      totalDays?: number;
    };
    summary?: {
      totalHours?: number;
      completedShifts?: number;
      overHours?: number;
    };
    todaysShiftLog?: {
      date?: string | null;
      workingHour?: {
        start?: string | null;
        end?: string | null;
      } | null;
      startTime?: string | null;
      endTime?: string | null;
    } | null;
    workPattern?: Array<{
      date: string;
      workedHours: number;
      completedShifts: number;
    }>;
  } | null>;
  getAttendanceLog: (params?: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => Promise<
    Array<{
      id: string;
      date?: string;
      clockInTime?: string | null;
      clockOutTime?: string | null;
      workingTime?: string | null;
      statusSummary?: string | null;
      business?: {
        id?: string;
        name?: string | null;
        logo?: string | null;
      } | null;
    }>
  >;
  getMyLatestIncompleteAttendance: (params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => Promise<
    Array<{
      id: string;
      employmentId?: string;
      shiftAssignmentId?: string;
      status?: string;
      createdAt?: string;
      updatedAt?: string;
      shiftAssignment?: {
        startsAt?: string;
        endsAt?: string;
        shiftTemplate?: {
          name?: string;
          business?: {
            logo?: string | null;
            city?: string;
            address?: {
              city?: string;
            } | null;
          } | null;
        } | null;
      } | null;
      shiftAttendanceSummary?: {
        assignedUsersCount?: number;
        presentUsersCount?: number;
        presentColleagueAvatarPreview?: string[];
      } | null;
    }>
  >;
  getWorkInsightsAnalytics: (params?: {
    month?: string;
  }) => Promise<{
    completedShifts?: number;
    workedHours?: number;
    performanceStatus?: number;
  } | null>;
  fetchMyShifts: (date?: string) => Promise<any[]>;
  fetchHomeShifts: (businessIds?: string[]) => Promise<any[]>;
  fetchBusinessAssignments: (
    businessId: string,
    params?: {
      page?: number;
      limit?: number;
      employmentId?: string;
      date?: string;
      shiftTemplateId?: string;
      append?: boolean;
    }
  ) => Promise<any[]>;
  getShiftRequests: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    type?: string;
    search?: string;
  }) => Promise<any[]>;
  getPendingSwapRequests: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<any[]>;
  getMyShiftRequests: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    type?: string;
  }) => Promise<any[]>;
  getUnresolvedShiftRequestCount: () => Promise<{
    shift_swap?: number;
    overtime_request?: number;
    leave_request?: number;
    manual_attendance?: number;
    schedule_change?: number;
    early_leave?: number;
    late_arrival?: number;
  }>;
  getBusinessUnresolvedShiftRequestCount: (businessId: string) => Promise<{
    leave_request?: number;
    overtime_request?: number;
  }>;
  getBusinessShiftRequests: (
    businessId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      sort?: string;
      status?: string;
      type?: string;
    }
  ) => Promise<any[]>;
  getBusinessColleagues: (businessId: string) => Promise<BusinessColleagueItem[]>;
  getShiftAssignmentDetails: (id: string) => Promise<any | null>;
  getBusinessShiftAssignmentDetails: (
    businessId: string,
    id: string
  ) => Promise<any | null>;
  submitBusinessManualAttendance: (payload: {
    businessId: string;
    shiftAssignmentId: string;
    clockInTime: string;
    clockOutTime: string;
    status: string;
  }) => Promise<any>;
  clockIn: (shiftAssignmentId: string) => Promise<any>;
  clockOut: (shiftId: string) => Promise<any>;
  createShiftRequest: (
    payload:
      | {
          employmentId: string;
          type: "leave_request";
          isHalfDay: boolean;
          startDate: string;
          endDate: string;
          leaveType: string;
          reason: string;
        }
      | {
          employmentId: string;
          shiftAssignmentId: string;
          type: "overtime_request";
          requestedDate: string;
          startTime: string;
          endTime: string;
          overtimeHours: number;
          overtimeRate: number;
          reason: string;
        }
      | {
          employmentId: string;
          type: "shift_swap";
          shiftAssignmentId: string;
          targetEmploymentIds: string[];
          reason?: string;
        }
      | {
          employmentId: string;
          type: "manual_attendance";
          manualAttendanceReasonType:
            | "missed_punch"
            | "late_arrival"
            | "early_departure"
            | "forgot_to_tap"
            | "network_issues"
            | "other";
          shiftAssignmentId?: string;
          attendanceDate?: string;
          clockInTime?: string;
          clockOutTime?: string;
          attendanceNotes?: string;
        }
  ) => Promise<any>;
  approveBusinessShiftRequest: (
    businessId: string,
    id: string,
    payload?: { approvalNotes?: string }
  ) => Promise<any>;
  rejectBusinessShiftRequest: (
    businessId: string,
    id: string,
    payload?: { responseNotes?: string }
  ) => Promise<any>;
  createShiftReport: (payload: {
    shiftAssignmentId: string;
    employmentId: string;
    type: "report" | "summary";
    issueType: string;
    notes: string;
    attachment?: string | null;
  }) => Promise<any>;
  getBusinessShiftReports: (
    businessId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ) => Promise<{
    data: Array<{
      id: string;
      type?: string;
      issueType?: string;
      notes?: string | null;
      attachment?: string | null;
      createdAt?: string;
      shiftAssignment?: {
        id?: string;
        date?: string;
        startsAt?: string;
        endsAt?: string;
        status?: string;
      } | null;
      employee?: {
        id?: string;
        user?: {
          id?: string;
          name?: string;
          avatar?: string | null;
        } | null;
      } | null;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
  clearMyShiftsError: () => void;
  clearHomeShiftsError: () => void;
  clearBusinessAssignmentsError: () => void;
  clearShiftRequestsError: () => void;
  clearBusinessShiftRequestsError: () => void;
  clearShiftAssignmentDetailsError: () => void;
  clearCreateShiftRequestError: () => void;
  clearApproveShiftRequestError: () => void;
  clearRejectShiftRequestError: () => void;
  clearCreateShiftReportError: () => void;
};

export const useShiftStore = create<ShiftStoreState>((set, get) => ({
  myShifts: [],
  myShiftsLoading: false,
  myShiftsError: null,
  myShiftsMeta: null,
  homeShifts: [],
  homeShiftsLoading: false,
  homeShiftsError: null,
  homeShiftsMeta: null,
  businessAssignments: [],
  businessAssignmentsLoading: false,
  businessAssignmentsError: null,
  businessAssignmentsMeta: null,
  businessAssignmentsPagination: null,
  shiftRequests: [],
  shiftRequestsLoading: false,
  shiftRequestsError: null,
  shiftRequestsPagination: null,
  businessShiftRequests: [],
  businessShiftRequestsLoading: false,
  businessShiftRequestsError: null,
  businessShiftRequestsPagination: null,
  shiftAssignmentDetails: null,
  shiftAssignmentDetailsLoading: false,
  shiftAssignmentDetailsError: null,
  createShiftRequestLoading: false,
  createShiftRequestError: null,
  approveShiftRequestLoading: false,
  approveShiftRequestError: null,
  rejectShiftRequestLoading: false,
  rejectShiftRequestError: null,
  createShiftReportLoading: false,
  createShiftReportError: null,

  fetchMyShifts: async (date) => {
    try {
      set({ myShiftsLoading: true, myShiftsError: null });
      const response = await axiosInstance.get("/shift-assignment/my-shifts", {
        params: date ? { date } : undefined,
      });
      console.log("[ShiftStore] fetchMyShifts raw response", response?.data);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load shifts");
      }

      const shifts = Array.isArray(result?.data) ? result.data : [];
      const nextShiftAtRaw = result?.metadata?.nextShiftAt;
      const nextShiftAt =
        typeof nextShiftAtRaw === "string" && nextShiftAtRaw.trim().length > 0
          ? nextShiftAtRaw
          : null;
      set({
        myShifts: shifts,
        myShiftsLoading: false,
        myShiftsMeta: {
          nextShiftAt,
        },
      });
      return shifts;
    } catch (error: any) {
      const message = error?.message || "Failed to load shifts";
      set({
        myShifts: [],
        myShiftsLoading: false,
        myShiftsError: message,
        myShiftsMeta: null,
      });
      throw error;
    }
  },

  clearMyShiftsError: () => set({ myShiftsError: null }),

  fetchHomeShifts: async (businessIds = []) => {
    try {
      const uniqueIds = Array.from(
        new Set((Array.isArray(businessIds) ? businessIds : []).filter(Boolean))
      );

      set({ homeShiftsLoading: true, homeShiftsError: null });

      let merged: any[] = [];
      let earliestNextShiftAt: string | null = null;
      let firstErrorMessage: string | null = null;

      if (uniqueIds.length === 0) {
        const response = await axiosInstance.get("/shift-assignment/my-shifts/home");
        const payload = response?.data;
        const successOk = payload?.success === true;
        if (!successOk) {
          throw new Error(payload?.message || "Failed to load home shifts");
        }
        merged = Array.isArray(payload?.data) ? payload.data : [];
        const nextShiftAtRaw = payload?.metadata?.nextShiftAt;
        earliestNextShiftAt =
          typeof nextShiftAtRaw === "string" && nextShiftAtRaw.trim().length > 0
            ? nextShiftAtRaw
            : null;
      } else {
        const responses = await Promise.allSettled(
          uniqueIds.map((businessId) =>
            axiosInstance.get("/shift-assignment/my-shifts/home", {
              params: { businessId },
            })
          )
        );

        responses.forEach((item) => {
          if (item.status === "fulfilled") {
            const payload = item.value?.data;
            const successOk = payload?.success === true;
            if (!successOk) {
              if (!firstErrorMessage) {
                firstErrorMessage = payload?.message || "Failed to load home shifts";
              }
              return;
            }

            const data = Array.isArray(payload?.data) ? payload.data : [];
            merged.push(...data);

            const nextShiftAtRaw = payload?.metadata?.nextShiftAt;
            const nextShiftAt =
              typeof nextShiftAtRaw === "string" && nextShiftAtRaw.trim().length > 0
                ? nextShiftAtRaw
                : null;
            if (nextShiftAt) {
              if (!earliestNextShiftAt) {
                earliestNextShiftAt = nextShiftAt;
              } else {
                const current = new Date(earliestNextShiftAt);
                const candidate = new Date(nextShiftAt);
                if (
                  !Number.isNaN(candidate.getTime()) &&
                  (Number.isNaN(current.getTime()) || candidate.getTime() < current.getTime())
                ) {
                  earliestNextShiftAt = nextShiftAt;
                }
              }
            }
            return;
          }

          if (!firstErrorMessage) {
            firstErrorMessage =
              (item.reason as any)?.message || "Failed to load home shifts";
          }
        });
      }

      set({
        homeShifts: merged,
        homeShiftsLoading: false,
        homeShiftsError: firstErrorMessage,
        homeShiftsMeta: {
          nextShiftAt: earliestNextShiftAt,
        },
      });

      return merged;
    } catch (error: any) {
      const message = error?.message || "Failed to load home shifts";
      set({
        homeShifts: [],
        homeShiftsLoading: false,
        homeShiftsError: message,
        homeShiftsMeta: null,
      });
      throw error;
    }
  },

  clearHomeShiftsError: () => set({ homeShiftsError: null }),

  fetchBusinessAssignments: async (businessId, params) => {
    try {
      if (!businessId) {
        set({
          businessAssignments: [],
          businessAssignmentsLoading: false,
          businessAssignmentsError: null,
          businessAssignmentsMeta: null,
          businessAssignmentsPagination: null,
        });
        return [];
      }

      set({
        businessAssignmentsLoading: true,
        businessAssignmentsError: null,
      });

      const response = await axiosInstance.get(`/shift-assignment/${businessId}`, {
        params: {
          page: params?.page,
          limit: params?.limit,
          employmentId: params?.employmentId,
          date: params?.date,
          shiftTemplateId: params?.shiftTemplateId,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load assignments");
      }

      const assignments = Array.isArray(result?.data) ? result.data : [];
      const pagination = result?.pagination || null;
      const metadata = result?.metadata || null;
      const shouldAppend =
        Boolean(params?.append) || (typeof params?.page === "number" && params.page > 1);
      const previous = shouldAppend ? (Array.isArray(get().businessAssignments) ? get().businessAssignments : []) : [];
      const merged = shouldAppend
        ? [
          ...previous,
          ...assignments.filter(
            (item: any) => !previous.some((prev: any) => prev?.id === item?.id)
          ),
        ]
        : assignments;
      set({
        businessAssignments: merged,
        businessAssignmentsLoading: false,
        businessAssignmentsMeta: metadata,
        businessAssignmentsPagination: pagination,
      });
      return merged;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load assignments";
      set({
        businessAssignments: [],
        businessAssignmentsLoading: false,
        businessAssignmentsError: message,
        businessAssignmentsMeta: null,
        businessAssignmentsPagination: null,
      });
      throw error;
    }
  },

  getShiftRequests: async (params) => {
    try {
      set({ shiftRequestsLoading: true, shiftRequestsError: null });
      const response = await axiosInstance.get("/shift-requests", {
        params: {
          page: params?.page,
          limit: params?.limit,
          startDate: params?.startDate,
          endDate: params?.endDate,
          status: params?.status,
          type: params?.type,
          search: params?.search,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to fetch shift requests");
      }

      const requests = Array.isArray(result?.data) ? result.data : [];
      set({
        shiftRequests: requests,
        shiftRequestsLoading: false,
        shiftRequestsPagination: result?.pagination || null,
      });
      return requests;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch shift requests";
      set({
        shiftRequests: [],
        shiftRequestsLoading: false,
        shiftRequestsError: message,
        shiftRequestsPagination: null,
      });
      throw new Error(message);
    }
  },

  getPendingSwapRequests: async (params) => {
    try {
      const response = await axiosInstance.get("/shift-requests/pending-swaps", {
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load pending swap requests");
      }

      return Array.isArray(result?.data) ? result.data : [];
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load pending swap requests";
      throw new Error(message);
    }
  },

  getMyShiftRequests: async (params) => {
    try {
      set({ shiftRequestsLoading: true, shiftRequestsError: null });
      const response = await axiosInstance.get("/shift-requests/my-requests", {
        params: {
          page: params?.page,
          limit: params?.limit,
          startDate: params?.startDate,
          endDate: params?.endDate,
          status: params?.status,
          type: params?.type,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to fetch my shift requests");
      }

      const requests = Array.isArray(result?.data) ? result.data : [];
      set({
        shiftRequests: requests,
        shiftRequestsLoading: false,
        shiftRequestsPagination: result?.pagination || null,
      });
      return requests;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch my shift requests";
      set({
        shiftRequests: [],
        shiftRequestsLoading: false,
        shiftRequestsError: message,
        shiftRequestsPagination: null,
      });
      throw new Error(message);
    }
  },

  getUnresolvedShiftRequestCount: async () => {
    try {
      const response = await axiosInstance.get("/shift-requests/unresolved-count");
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to fetch unresolved shift request count"
        );
      }

      return result?.data || {};
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch unresolved shift request count";
      throw new Error(message);
    }
  },

  getBusinessUnresolvedShiftRequestCount: async (businessId) => {
    try {
      if (!businessId) return {};

      const response = await axiosInstance.get(
        `/shift-requests/business/${businessId}/unresolved-count`
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to fetch business unresolved shift request count"
        );
      }

      return result?.data || {};
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch business unresolved shift request count";
      throw new Error(message);
    }
  },

  getBusinessShiftRequests: async (businessId, params) => {
    try {
      if (!businessId) {
        set({
          businessShiftRequests: [],
          businessShiftRequestsLoading: false,
          businessShiftRequestsError: null,
          businessShiftRequestsPagination: null,
        });
        return [];
      }

      set({
        businessShiftRequestsLoading: true,
        businessShiftRequestsError: null,
      });
      const rawParams = {
        page: params?.page,
        limit: params?.limit,
        startDate: params?.startDate,
        endDate: params?.endDate,
        sort: params?.sort,
        status: params?.status,
        type: params?.type,
      };
      const requestParams = Object.fromEntries(
        Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== "")
      );
      console.log("[ShiftStore] GET /shift-requests/business/:id payload", {
        businessId,
        params: requestParams,
      });

      const response = await axiosInstance.get(
        `/shift-requests/business/${businessId}`,
        {
          params: requestParams,
        }
      );
      const result = response?.data;
      console.log("[ShiftStore] GET /shift-requests/business/:id response", result);

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to fetch business shift requests"
        );
      }

      const requests = Array.isArray(result?.data) ? result.data : [];
      set({
        businessShiftRequests: requests,
        businessShiftRequestsLoading: false,
        businessShiftRequestsPagination: result?.pagination || null,
      });
      return requests;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch business shift requests";
      set({
        businessShiftRequests: [],
        businessShiftRequestsLoading: false,
        businessShiftRequestsError: message,
        businessShiftRequestsPagination: null,
      });
      throw new Error(message);
    }
  },

  getBusinessColleagues: async (businessId) => {
    try {
      if (!businessId) return [];
      const response = await axiosInstance.get(
        `/employment/businesses/${businessId}/colleagues`
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to fetch colleagues");
      }

      return Array.isArray(result?.data) ? result.data : [];
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch colleagues";
      throw new Error(message);
    }
  },

  getShiftAssignmentDetails: async (id) => {
    try {
      if (!id) {
        set({
          shiftAssignmentDetails: null,
          shiftAssignmentDetailsLoading: false,
          shiftAssignmentDetailsError: null,
        });
        return null;
      }

      set({
        shiftAssignmentDetailsLoading: true,
        shiftAssignmentDetailsError: null,
      });

      const response = await axiosInstance.get(`/shift-assignment/details/${id}`);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load shift details");
      }

      const details = result?.data || null;
      set({
        shiftAssignmentDetails: details,
        shiftAssignmentDetailsLoading: false,
      });
      return details;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load shift details";
      set({
        shiftAssignmentDetails: null,
        shiftAssignmentDetailsLoading: false,
        shiftAssignmentDetailsError: message,
      });
      throw new Error(message);
    }
  },

  getBusinessShiftAssignmentDetails: async (businessId, id) => {
    try {
      if (!businessId || !id) {
        set({
          shiftAssignmentDetails: null,
          shiftAssignmentDetailsLoading: false,
          shiftAssignmentDetailsError: null,
        });
        return null;
      }

      set({
        shiftAssignmentDetailsLoading: true,
        shiftAssignmentDetailsError: null,
      });

      const response = await axiosInstance.get(
        `/shift-assignment/${businessId}/details/${id}`
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load shift details");
      }

      const details = result?.data || null;
      set({
        shiftAssignmentDetails: details,
        shiftAssignmentDetailsLoading: false,
      });
      return details;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load shift details";
      set({
        shiftAssignmentDetails: null,
        shiftAssignmentDetailsLoading: false,
        shiftAssignmentDetailsError: message,
      });
      throw new Error(message);
    }
  },

  submitBusinessManualAttendance: async ({
    businessId,
    shiftAssignmentId,
    clockInTime,
    clockOutTime,
    status,
  }) => {
    try {
      if (!businessId || !shiftAssignmentId) {
        throw new Error("Business id and shift assignment id are required");
      }

      const response = await axiosInstance.put(
        `/attendance/business/${businessId}/shift/${shiftAssignmentId}/manual`,
        {
          clockInTime,
          clockOutTime,
          status,
        }
      );

      const result = response?.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to submit manual attendance");
      }

      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit manual attendance";
      throw new Error(message);
    }
  },

  clockIn: async (shiftAssignmentId) => {
    try {
      const response = await axiosInstance.post("/attendance/clock-in", {
        shiftAssignmentId,
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "attendance_shift_assignment_not_found_or_access_denied"
        );
      }

      const updatePresentStatus = (shift: any) =>
        shift?.id === shiftAssignmentId
          ? { ...shift, presentStatus: "logged_in" }
          : shift;

      set((state) => ({
        homeShifts: Array.isArray(state.homeShifts)
          ? state.homeShifts.map(updatePresentStatus)
          : state.homeShifts,
        myShifts: Array.isArray(state.myShifts)
          ? state.myShifts.map(updatePresentStatus)
          : state.myShifts,
      }));

      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to clock in";
      throw new Error(message);
    }
  },

  clockOut: async (shiftId) => {
    try {
      const response = await axiosInstance.put(`/attendance/${shiftId}/clock-out`);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "attendance_shift_assignment_not_found_or_access_denied"
        );
      }

      const updatePresentStatus = (shift: any) =>
        shift?.id === shiftId
          ? { ...shift, presentStatus: "logged_out" }
          : shift;

      set((state) => ({
        homeShifts: Array.isArray(state.homeShifts)
          ? state.homeShifts.map(updatePresentStatus)
          : state.homeShifts,
        myShifts: Array.isArray(state.myShifts)
          ? state.myShifts.map(updatePresentStatus)
          : state.myShifts,
      }));

      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to clock out";
      throw new Error(message);
    }
  },

  createShiftRequest: async (payload) => {
    try {
      set({ createShiftRequestLoading: true, createShiftRequestError: null });
      const response = await axiosInstance.post("/shift-requests", payload);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to submit leave request");
      }

      set({ createShiftRequestLoading: false });
      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit leave request";
      set({
        createShiftRequestLoading: false,
        createShiftRequestError: message,
      });
      throw new Error(message);
    }
  },

  approveBusinessShiftRequest: async (businessId, id, payload) => {
    try {
      if (!businessId || !id) {
        throw new Error("Business id and request id are required");
      }

      set({ approveShiftRequestLoading: true, approveShiftRequestError: null });
      const response = await axiosInstance.post(
        `/shift-requests/business/${businessId}/${id}/approve`,
        payload
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to approve shift request");
      }

      const approvedItem = result?.data;
      set((state) => ({
        approveShiftRequestLoading: false,
        businessShiftRequests: Array.isArray(state.businessShiftRequests)
          ? state.businessShiftRequests.map((item: any) =>
              item?.id === approvedItem?.id ? { ...item, ...approvedItem } : item
            )
          : state.businessShiftRequests,
      }));

      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve shift request";
      set({
        approveShiftRequestLoading: false,
        approveShiftRequestError: message,
      });
      throw new Error(message);
    }
  },

  rejectBusinessShiftRequest: async (businessId, id, payload) => {
    try {
      if (!businessId || !id) {
        throw new Error("Business id and request id are required");
      }

      set({ rejectShiftRequestLoading: true, rejectShiftRequestError: null });
      const response = await axiosInstance.post(
        `/shift-requests/business/${businessId}/${id}/reject`,
        payload
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to reject shift request");
      }

      const rejectedItem = result?.data;
      set((state) => ({
        rejectShiftRequestLoading: false,
        businessShiftRequests: Array.isArray(state.businessShiftRequests)
          ? state.businessShiftRequests.map((item: any) =>
              item?.id === rejectedItem?.id ? { ...item, ...rejectedItem } : item
            )
          : state.businessShiftRequests,
      }));

      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject shift request";
      set({
        rejectShiftRequestLoading: false,
        rejectShiftRequestError: message,
      });
      throw new Error(message);
    }
  },

  createShiftReport: async (payload) => {
    try {
      set({ createShiftReportLoading: true, createShiftReportError: null });
      let result: any;
      if (payload instanceof FormData) {
        const baseURL = String(process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
        if (!baseURL) {
          throw new Error("API base URL is missing");
        }
        const accessToken = await AsyncStorage.getItem("auth_access_token");
        const response = await fetch(`${baseURL}/shift-reports`, {
          method: "POST",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: payload,
        });
        result = await response.json();
        if (!response.ok) {
          throw new Error(result?.message || "Failed to submit shift report");
        }
      } else {
        const response = await axiosInstance.post("/shift-reports", payload, {
          timeout: 60000,
          transformRequest: (data) => data,
        });
        result = response?.data;
      }
      if (!result?.success) {
        throw new Error(result?.message || "Failed to submit shift report");
      }

      set({ createShiftReportLoading: false });
      return result;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit shift report";
      set({
        createShiftReportLoading: false,
        createShiftReportError: message,
      });
      throw new Error(message);
    }
  },

  getBusinessShiftReports: async (businessId, params) => {
    try {
      if (!businessId) {
        throw new Error("Business id is required");
      }

      const page = Number(params?.page ?? 1);
      const limit = Number(params?.limit ?? 10);
      const response = await axiosInstance.get(
        `/shift-reports/business/${businessId}`,
        {
          params: { page, limit },
        }
      );
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load shift reports");
      }

      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: {
          total: Number(result?.pagination?.total || 0),
          page: Number(result?.pagination?.page || page),
          limit: Number(result?.pagination?.limit || limit),
          totalPages: Number(result?.pagination?.totalPages || 1),
          hasNext: Boolean(result?.pagination?.hasNext),
          hasPrev: Boolean(result?.pagination?.hasPrev),
        },
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load shift reports";
      throw new Error(message);
    }
  },

  getTrackHoursAnalytics: async (params) => {
    try {
      const response = await axiosInstance.get("/analytics/track-hours", {
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to load track hours analytics"
        );
      }

      return result?.data || null;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load track hours analytics";
      throw new Error(message);
    }
  },

  getWorkInsightsAnalytics: async (params) => {
    try {
      const response = await axiosInstance.get("/analytics/work-insights", {
        params: {
          month: params?.month,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to load work insights analytics"
        );
      }

      return result?.data || null;
    } catch (error: any) {
      if (error?.isAuthSessionExpired || error?.response?.status === 401) {
        const authError = new Error("");
        (authError as any).isAuthSessionExpired = true;
        throw authError;
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load work insights analytics";
      throw new Error(message);
    }
  },

  getAttendanceLog: async (params) => {
    try {
      const response = await axiosInstance.get("/attendance/attendance-log", {
        params: {
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          page: params?.page,
          limit: params?.limit,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load attendance log");
      }

      return Array.isArray(result?.data) ? result.data : [];
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load attendance log";
      throw new Error(message);
    }
  },

  getMyLatestIncompleteAttendance: async (params) => {
    try {
      const response = await axiosInstance.get("/attendance/my/latest-incomplete", {
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
          page: params?.page,
          limit: params?.limit,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to load latest incomplete attendance"
        );
      }

      return Array.isArray(result?.data) ? result.data : [];
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load latest incomplete attendance";
      throw new Error(message);
    }
  },

  clearBusinessAssignmentsError: () => set({ businessAssignmentsError: null }),
  clearShiftRequestsError: () => set({ shiftRequestsError: null }),
  clearBusinessShiftRequestsError: () =>
    set({ businessShiftRequestsError: null }),
  clearShiftAssignmentDetailsError: () =>
    set({ shiftAssignmentDetailsError: null }),
  clearCreateShiftRequestError: () => set({ createShiftRequestError: null }),
  clearApproveShiftRequestError: () => set({ approveShiftRequestError: null }),
  clearRejectShiftRequestError: () => set({ rejectShiftRequestError: null }),
  clearCreateShiftReportError: () => set({ createShiftReportError: null }),
}));
