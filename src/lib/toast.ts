import { toast as sonnerToast } from "sonner";

export const toast = {
  success(message: string, description?: string) {
    return sonnerToast.success(message, { description });
  },

  error(message: string, description?: string) {
    return sonnerToast.error(message, { description });
  },

  warning(message: string, description?: string) {
    return sonnerToast.warning(message, { description });
  },

  info(message: string, description?: string) {
    return sonnerToast.info(message, { description });
  },

  message(message: string, description?: string) {
    return sonnerToast(message, { description });
  },

  promise<T>(
    promise: Promise<T>,
    messages: Readonly<{
      loading: string;
      success: string;
      error: string;
    }>,
  ) {
    return sonnerToast.promise(promise, messages);
  },

  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  },
};
