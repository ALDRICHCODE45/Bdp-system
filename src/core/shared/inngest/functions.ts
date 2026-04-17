import { fridayReminderCron } from "./functions/fridayReminderCron";
import { mondayReportCron } from "./functions/mondayReportCron";
import { handleEditRequestCreated } from "./functions/handleEditRequestCreated";
import { handleEditRequestAuthorized } from "./functions/handleEditRequestAuthorized";

export const functions = [
  fridayReminderCron,
  mondayReportCron,
  handleEditRequestCreated,
  handleEditRequestAuthorized,
];
