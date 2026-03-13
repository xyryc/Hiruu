import axiosInstance from "@/utils/axios";
import { create } from "zustand";
import type { LeaveCreditItem } from "@/types";

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
  leaveCreditsByBusiness: Record<string, LeaveCreditItem | null>;
  leaveCreditsLoading: boolean;
  leaveCreditsError: string | null;
  createShiftRequestLoading: boolean;
  createShiftRequestError: string | null;
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
  clockIn: (shiftAssignmentId: string) => Promise<any>;
  clockOut: (shiftId: string) => Promise<any>;
  getMyLeaveCredits: (businessId: string) => Promise<LeaveCreditItem | null>;
  createShiftRequest: (payload: {
    employmentId: string;
    type: "leave_request";
    isHalfDay: boolean;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
  }) => Promise<any>;
  clearMyShiftsError: () => void;
  clearHomeShiftsError: () => void;
  clearBusinessAssignmentsError: () => void;
  clearShiftRequestsError: () => void;
  clearLeaveCreditsError: () => void;
  clearCreateShiftRequestError: () => void;
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
  leaveCreditsByBusiness: {},
  leaveCreditsLoading: false,
  leaveCreditsError: null,
  createShiftRequestLoading: false,
  createShiftRequestError: null,

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

  getMyLeaveCredits: async (businessId) => {
    try {
      if (!businessId) {
        return null;
      }

      set({ leaveCreditsLoading: true, leaveCreditsError: null });
      const response = await axiosInstance.get("/leave/my-credits", {
        params: { businessId },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to fetch leave credits");
      }

      const leaveCredit = Array.isArray(result?.data) ? result.data[0] || null : null;
      set((state) => ({
        leaveCreditsByBusiness: {
          ...state.leaveCreditsByBusiness,
          [businessId]: leaveCredit,
        },
        leaveCreditsLoading: false,
      }));
      return leaveCredit;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch leave credits";
      set({
        leaveCreditsLoading: false,
        leaveCreditsError: message,
      });
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

  clearBusinessAssignmentsError: () => set({ businessAssignmentsError: null }),
  clearShiftRequestsError: () => set({ shiftRequestsError: null }),
  clearLeaveCreditsError: () => set({ leaveCreditsError: null }),
  clearCreateShiftRequestError: () => set({ createShiftRequestError: null }),
}));
