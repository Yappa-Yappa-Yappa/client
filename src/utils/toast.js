import toast from "react-hot-toast";

const MAX_ACTIVE_TOASTS = 4;
const TOAST_DURATION = 3500;
const activeToastIds = [];

const showToast = (createToast) => {
  while (activeToastIds.length >= MAX_ACTIVE_TOASTS) {
    toast.dismiss(activeToastIds.shift());
  }

  const toastId = createToast();
  activeToastIds.push(toastId);

  window.setTimeout(() => {
    const index = activeToastIds.indexOf(toastId);
    if (index !== -1) activeToastIds.splice(index, 1);
  }, TOAST_DURATION);

  return toastId;
};

export const showSuccessToast = (message) =>
  showToast(() => toast.success(message));

export const showErrorToast = (message) =>
  showToast(() => toast.error(message));

export const showWarningToast = (message) =>
  showToast(() => toast(message, { icon: "⚠️" }));
