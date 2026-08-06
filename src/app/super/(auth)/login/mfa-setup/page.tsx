import { redirect } from "next/navigation";

export default function SuperLoginMfaSetupRedirectPage() {
  redirect("/login/mfa-setup");
}
