export type ShiftPresentStatus = "logged_in" | "logged_out" | string;

export type ApiShift = {
  itemType?: "assigned_shift" | "empty_day";
  id?: string;
  date?: string;
  status?: string;
  presentStatus?: ShiftPresentStatus;
  startsAt?: string;
  endsAt?: string;
  hasNextShift?: boolean;
  nextShiftStartDate?: string;
  totalMembers?: number;
  colleagueAvatars?: string[];
  shiftTemplate?: {
    name?: string;
    startTime?: string;
    endTime?: string;
  };
  business?: {
    id?: string;
    name?: string;
    logo?: string | null;
    address?:
      | string
      | {
          line1?: string;
          address?: string;
          city?: string;
          state?: string;
          country?: string;
        };
  };
};

export type ShiftCardStatus =
  | "ongoing"
  | "upcoming"
  | "completed"
  | "missed"
  | "early_leave";

export type ShiftCardData = {
  id: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  startsAt?: string;
  endsAt?: string;
  startDateTime?: string;
  endDateTime?: string;
  shiftImage: any;
  teamMembers: string[];
  totalMembers: number;
  address: string;
  city: string;
  status: ShiftCardStatus;
  presentStatus?: ShiftPresentStatus;
};
