import {
  destroyAdminSession,
  isAdminAuthenticated as gateAuthenticated,
} from "./bramaAdmina";

export async function isAdminAuthenticated(): Promise<boolean> {
  return gateAuthenticated();
}

/** @deprecated sesja niszczona przez action=logout */
export async function clearAdminSession() {
  await destroyAdminSession();
}
