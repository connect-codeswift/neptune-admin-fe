import { redirect } from "next/navigation";

export default function SuperResetPasswordRedirectPage() {
  redirect("/reset-password");
}
