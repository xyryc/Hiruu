export interface MyEmploymentBusiness {
  id: string;
  name: string;
  logo?: string;
}

export interface MyEmploymentItem {
  id: string;
  businessId: string;
  status?: string;
  business?: MyEmploymentBusiness;
}

export interface MyEmploymentsResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
  data: MyEmploymentItem[];
}
