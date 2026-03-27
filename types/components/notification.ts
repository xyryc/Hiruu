export type GeneralSettings = {
  shiftReminders: boolean;
  scheduleUpdates: boolean;
  newAssigned: boolean;
  shiftCancellation: boolean;
  managerMessages: boolean;
};

export type EmailSettings = {
  dailyWeeklyReports: boolean;
  subscriptionPaymentUpdates: boolean;
  leaveRequestStatus: boolean;
  shiftCancellation: boolean;
  importantAnnouncements: boolean;
};

export type PushSettings = {
  newMessageAlerts: boolean;
  ratingReviewReceived: boolean;
  newJobOpportunities: boolean;
  appUpdatesTips: boolean;
};
