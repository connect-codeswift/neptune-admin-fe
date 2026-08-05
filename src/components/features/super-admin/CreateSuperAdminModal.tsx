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

export function CreateSuperAdminModal({
  open,
  onClose,
}: CreateSuperAdminModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = async () => {
    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!fullName) {
      toast.error("Full name is required.");
      return;
    }
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

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
      primaryLabel={loading ? "Creating…" : "Create Account"}
      secondaryLabel="Cancel"
      onSecondary={resetAndClose}
      loading={loading}
      disabled={loading}
      closeOnBackdrop={!loading}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text5 text-gray">
          Add another CodeSwift staff member who can sign in to the super admin
          dashboard. They will set up MFA on first login.
        </p>

        <TextInput
          label="Full Name"
          placeholder="e.g. Alex Rivera"
          value={form.fullName}
          onChange={(event) =>
            setForm((current) => ({ ...current, fullName: event.target.value }))
          }
          required
          disabled={loading}
        />

        <EmailInput
          label="Email"
          placeholder="staff@neptunehs.com"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          required
          disabled={loading}
        />

        <PasswordInput
          label="Password"
          placeholder="Minimum 8 characters"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          helperText="At least 8 characters."
          required
          disabled={loading}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
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
