export interface Profile {
  id: string;
  name: string | null;
  user_id: string | null;
  birth_date: string;
  work_start_date: string;
  created_at: string;
  updated_at: string;
}

export enum UserSpecialPermissionType {
  MANAGE_WORK_DAY_EXCEPTION = 0,
}

export interface UserSpecialPermission {
  id: number;
  user_id: string;
  created_at: string;
  permission: UserSpecialPermissionType;
}
