import axiosInstance from "@/utils/axios";
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
  homeShifts: any[];
  homeShiftsLoading: boolean;
  homeShiftsError: string | null;
  businessAssignments: any[];
  businessAssignmentsLoading: boolean;
  businessAssignmentsError: string | null;
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
    workPattern?: Array<{
      date: string;
      workedHours: number;
      completedShifts: number;
    }>;
  } | null>;
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
  }) => Promise<any[]>;
  getMyShiftRequests: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    type?: string;
  }) => Promise<any[]>;
  getBusinessShiftRequests: (
    businessId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
    }
  ) => Promise<any[]>;
  getBusinessColleagues: (businessId: string) => Promise<BusinessColleagueItem[]>;
  getShiftAssignmentDetails: (id: string) => Promise<any | null>;
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
  homeShifts: [],
  homeShiftsLoading: false,
  homeShiftsError: null,
  businessAssignments: [],
  businessAssignmentsLoading: false,
  businessAssignmentsError: null,
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
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load shifts");
      }

      const shifts = Array.isArray(result?.data) ? result.data : [];
      set({ myShifts: shifts, myShiftsLoading: false });
      return shifts;
    } catch (error: any) {
      const message = error?.message || "Failed to load shifts";
      set({
        myShifts: [],
        myShiftsLoading: false,
        myShiftsError: message,
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
      let firstErrorMessage: string | null = null;

      if (uniqueIds.length === 0) {
        const response = await axiosInstance.get("/shift-assignment/my-shifts/home");
        const payload = response?.data;
        const successOk = payload?.success === true;
        if (!successOk) {
          throw new Error(payload?.message || "Failed to load home shifts");
        }
        merged = Array.isArray(payload?.data) ? payload.data : [];
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
      });

      return merged;
    } catch (error: any) {
      const message = error?.message || "Failed to load home shifts";
      set({
        homeShifts: [],
        homeShiftsLoading: false,
        homeShiftsError: message,
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

      const response = await axiosInstance.get(
        `/shift-requests/business/${businessId}`,
        {
          params: {
            page: params?.page,
            limit: params?.limit,
            status: params?.status,
            type: params?.type,
          },
        }
      );
      const result = response?.data;

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
      const response = await axiosInstance.post("/shift-reports", payload);
      const result = response?.data;

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
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load work insights analytics";
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
