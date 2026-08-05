import { redirect } from "next/navigation";

/**
 * There is one login screen now. This route is kept so existing bookmarks and links to the
 * staff-only sign-in still land somewhere useful instead of 404ing; /login serves both
 * audiences and figures out which this is.
 */
export default function SuperAdminLoginPage() {
  redirect("/login");
}
