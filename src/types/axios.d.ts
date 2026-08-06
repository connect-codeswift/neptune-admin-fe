import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** When true, use the staff auth token even if an org token is stored. */
    neptuneUseStaffToken?: boolean;
  }
}
