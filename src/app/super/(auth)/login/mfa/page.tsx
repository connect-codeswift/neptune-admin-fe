import { redirect } from "next/navigation";

export default function SuperLoginMfaRedirectPage() {
  redirect("/login/mfa");
}
