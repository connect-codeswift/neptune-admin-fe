import { redirect } from "next/navigation";

export default function SuperLoginRedirectPage() {
  redirect("/login");
}
