"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmailInput, PasswordInput, TextInput } from "@/components/inputs";
import { Modal } from "@/components/ui";
import type { SuperAdminCreatePayload } from "@/dtos/req/auth.req";
import { assertApiSuccess } from "@/lib/api-response";
import { createSuperAdmin } from "@/services/super-admin-auth.service";

type CreateSuperAdminModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

const EMPTY_FORM: SuperAdminCreatePayload & { confirmPassword: string } = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function CreateSuperAdminModal({
  open,
  onClose,
}: CreateSuperAdminModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  // Four toast messages fired one at a time, each after a click, was the whole
  // validation story here. The rules live next to the fields now and only
  // appear once the user has said they are done.
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fullName = form.fullName.trim();
  const email = form.email.trim();

  let fullNameError: string | undefined;
  let emailError: string | undefined;
  let passwordError: string | undefined;
  let confirmError: string | undefined;

  if (!fullName) {
    fullNameError = "Enter the staff member's full name.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    emailError = "Enter a valid email address — it doubles as their username.";
  }
  if (form.password.length < MIN_PASSWORD_LENGTH) {
    passwordError = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (form.confirmPassword !== form.password) {
    confirmError = "Both passwords have to match.";
  }

  const isValid = !fullNameError && !emailError && !passwordError && !confirmError;

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    setSubmitAttempted(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isValid) return;

    setLoading(true);
    try {
      const response = await createSuperAdmin({
        fullName,
        email,
        password: form.password,
      });
      assertApiSuccess(response, "Failed to create staff account.");
      toast.success(response.message || "Staff account created.");
      resetAndClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create staff account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Create Staff Account"
      onClose={resetAndClose}
      onPrimary={() => void handleSubmit()}
      primaryLabel="Create Account"
      secondaryLabel="Cancel"
      onSecondary={resetAndClose}
      loading={loading}
      closeOnBackdrop={!loading}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text4 text-gray">
          Add another CodeSwift staff member who can sign in to the super admin
          dashboard. They will set up MFA on first login.
        </p>

        <TextInput
          label="Full Name *"
          placeholder="e.g. Alex Rivera"
          value={form.fullName}
          error={submitAttempted ? fullNameError : undefined}
          onChange={(event) =>
            setForm((current) => ({ ...current, fullName: event.target.value }))
          }
          required
          disabled={loading}
        />

        <EmailInput
          label="Email *"
          placeholder="staff@neptunehs.com"
          value={form.email}
          error={submitAttempted ? emailError : undefined}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          required
          disabled={loading}
        />

        <PasswordInput
          label="Password *"
          placeholder="Minimum 8 characters"
          value={form.password}
          error={submitAttempted ? passwordError : undefined}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          helperText="At least 8 characters."
          required
          disabled={loading}
        />

        <PasswordInput
          label="Confirm Password *"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          // The mismatch is worth flagging as soon as there is something to
          // compare, rather than waiting for a click the user is about to make.
          error={
            form.confirmPassword.length > 0 || submitAttempted
              ? confirmError
              : undefined
          }
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              confirmPassword: event.target.value,
            }))
          }
          required
          disabled={loading}
        />
      </div>
    </Modal>
  );
}
