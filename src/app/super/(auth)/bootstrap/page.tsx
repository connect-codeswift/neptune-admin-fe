import { notFound } from "next/navigation";
import { SuperAdminBootstrapForm } from "@/components/features/auth/SuperAdminBootstrapForm";

export default function SuperAdminBootstrapPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_SUPERADMIN_BOOTSTRAP !== "true") {
    notFound();
  }

  return <SuperAdminBootstrapForm />;
}
