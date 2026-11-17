import { backendPort } from "@/ports/backend/BackendPort";
import { useToastService } from "@/modules/master/MasterServiceContainer";
import { AttendanceService } from "./services/AttendanceService";
import { AttendancePresentationService } from "./services/AttendancePresentationService";
import { AttendanceFormService } from "./services/AttendanceFormService";

export const useAttendancePresentationService = () =>
  new AttendancePresentationService();
export const useAttendanceFormService = () =>
  new AttendanceFormService(useAttendancePresentationService());
export const useAttendanceService = () => {
  const presentation = useAttendancePresentationService();
  return new AttendanceService(
    backendPort,
    useToastService(),
    presentation,
    new AttendanceFormService(presentation),
  );
};
