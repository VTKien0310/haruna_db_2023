import type { RouteLocationRaw } from "vue-router";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import { AttendanceAccess } from "./services/AttendanceAccessService";

export async function ensureWorkdayExceptionAccess(): Promise<
  true | RouteLocationRaw
> {
  const { useAttendanceAccessService } =
    await import("./AttendanceServiceContainer");
  const access = await useAttendanceAccessService().manageWorkdayExceptions();
  if (access === AttendanceAccess.ALLOWED) return true;
  return {
    name:
      access === AttendanceAccess.UNAUTHENTICATED
        ? AuthRouteName.LOGIN
        : MasterRouteName.NOT_FOUND,
  };
}
