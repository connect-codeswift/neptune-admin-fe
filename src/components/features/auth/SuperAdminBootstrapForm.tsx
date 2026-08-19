"use client";

import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput, TextInput } from "@/components/inputs";
import { Button } from "@/components/ui";
import { PasswordRequirements } from "@/components/features/shared/PasswordRequirements";
import {
  validateEmail,
  validateNewPassword,
} from "@/components/settings/settings-validation";
import { assertApiSuccess } from "@/lib/api-response";
import { PORTAL_AUTH } from "@/lib/auth-flow";
import { superAdminBootstrap } from "@/services/super-admin-auth.service";
import {
  AuthBackLink,
  AuthFormError,
  AuthFormHeader,
  AuthNextStepNote,
  AuthStatus,
} from "./AuthFormChrome";

const FORM_ERROR_ID = "bootstrap-error";
const NEW_PASSWORD_ID = "bootstrap-new-password";
const PASSWORD_RULES_ID = "bootstrap-password-rules";

type FieldErrors = {
  email: string | null;
  bootstrapKey: string | null;
  password: string | null;
};

const NO_FIELD_ERRORS: FieldErrors = {
  email: null,
  bootstrapKey: null,
  password: null,
};

export function SuperAdminBootstrapForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(NO_FIELD_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      bootstrapKey: bootstrapKey.trim()
        ? null
        : "Enter the bootstrap key from your server configuration.",
      password: validateNewPassword(password),
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setFormError("Check the highlighted fields and try again.");
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      const response = await superAdminBootstrap({
        email: email.trim(),
        password,
        bootstrapKey: bootstrapKey.trim(),
      });
      assertApiSuccess(response, "Bootstrap failed.");
      // The redirect unmounts this form, so the confirmation has to outlive it.
      toast.success("Super admin password set. You can sign in now.");
      router.replace(PORTAL_AUTH.loginPath);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Bootstrap failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  // `PasswordInput` spreads caller props last, so the rule list and the field's own error
  // message are listed together rather than one replacing the other.
  const passwordDescribedBy = [
    fieldErrors.password ? `${NEW_PASSWORD_ID}-error` : null,
    PASSWORD_RULES_ID,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <AuthFormHeader
        title="Bootstrap super admin"
        description="One-time setup for the seeded platform account. It works once, and only with the key from your server configuration."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-8">
        <EmailInput
          label="Email address"
          placeholder="superadmin@codeswift.org"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: null }));
          }}
          required
          autoComplete="username"
          helperText="The seeded platform account this password will belong to."
          error={fieldErrors.email ?? undefined}
          disabled={loading}
        />

        <TextInput
          label="Bootstrap key"
          placeholder="From server configuration"
          value={bootstrapKey}
          onChange={(event) => {
            setBootstrapKey(event.target.value);
            setFieldErrors((current) => ({ ...current, bootstrapKey: null }));
          }}
          required
          autoComplete="off"
          helperText="Set by whoever deployed the API. If you do not have it, ask them rather than guessing."
          error={fieldErrors.bootstrapKey ?? undefined}
          disabled={loading}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            id={NEW_PASSWORD_ID}
            label="New password"
            placeholder="Enter a new password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: null }));
            }}
            required
            autoComplete="new-password"
            aria-describedby={passwordDescribedBy}
            error={fieldErrors.password ?? undefined}
            disabled={loading}
          />
          {/* Stated up front, not after a rejected submit. */}
          <PasswordRequirements id={PASSWORD_RULES_ID} value={password} />
        </div>

        <AuthFormError id={FORM_ERROR_ID} message={formError} />

        <AuthStatus visuallyHidden>
          {loading ? "Setting the super admin password…" : ""}
        </AuthStatus>

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-2"
          loading={loading}
          loadingText="Setting password…"
          aria-busy={loading || undefined}
          aria-describedby={formError ? FORM_ERROR_ID : undefined}
        >
          Set password
        </Button>

        <AuthNextStepNote>
          Next: sign in with this address and password, then set up an
          authenticator app.
        </AuthNextStepNote>

        <AuthBackLink href={PORTAL_AUTH.loginPath}>Back to sign in</AuthBackLink>
      </form>
    </div>
  );
}
