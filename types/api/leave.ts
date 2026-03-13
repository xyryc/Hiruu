export interface LeaveCreditItem {
  employmentId: string;
  businessId: string;
  total: number;
  used: number;
  remaining: number;
  recurringType?: string;
  sick_leave: number;
  personal_leave: number;
  work_from_home: number;
  emergency_leave: number;
  casual_leave: number;
  unpaid_leave: number;
  other_leave: number;
  isHalfDay?: boolean;
  distributedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveCreditsResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
  data: LeaveCreditItem[];
}
