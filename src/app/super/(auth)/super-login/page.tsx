import { redirect } from "next/navigation";

// if mistaken the spelling to the login page, it will redirect to the login page
export default function SuperLoginRedirect() {
  redirect("/super/login");
}
