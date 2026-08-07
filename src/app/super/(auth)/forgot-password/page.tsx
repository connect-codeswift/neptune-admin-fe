import { redirect } from "next/navigation";

export default function SuperForgotPasswordRedirectPage() {
  redirect("/forgot-password");
}
