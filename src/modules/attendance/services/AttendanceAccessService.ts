import type { BackendPort } from "@/ports/backend/BackendPort";
import { UserSpecialPermissionType } from "@/modules/auth/AuthEntities";

export enum AttendanceAccess {
  ALLOWED = "allowed",
  UNAUTHENTICATED = "unauthenticated",
  DENIED = "denied",
}

export class AttendanceAccessService {
  constructor(private readonly backend: BackendPort) {}

  async manageWorkdayExceptions(): Promise<AttendanceAccess> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.backend.spbClient.auth.getUser();
      if (userError || !user) return AttendanceAccess.UNAUTHENTICATED;

      const { data, error } = await this.backend.spbClient
        .from("user_special_permissions")
        .select("permission")
        .eq("user_id", user.id)
        .eq("permission", UserSpecialPermissionType.MANAGE_WORKDAY_EXCEPTIONS)
        .limit(1);
      if (error || !data) return AttendanceAccess.DENIED;
      return data.length ? AttendanceAccess.ALLOWED : AttendanceAccess.DENIED;
    } catch {
      return AttendanceAccess.DENIED;
    }
  }
}
