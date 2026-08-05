import { LoginForm } from "@/components/features/auth/LoginForm";

/**
 * The one sign-in for this portal. CodeSwift staff and a customer's own admin both use it;
 * the backend resolves which, and the MFA and company-selection steps that follow are
 * unchanged for each.
 */
export default function LoginPage() {
  return <LoginForm flow="portal" />;
}
