import { toast, ToastOptions } from "react-toastify";

class Toast {
    private static defaultOptions: ToastOptions = {
        position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    };

    static success(message: string, options?: ToastOptions): void {
        toast.success(message, { ...this.defaultOptions, ...options });
    }

    static error(message: string, options?: ToastOptions): void {
        toast.error(message, { ...this.defaultOptions, ...options });
    }

    static info(message: string, options?: ToastOptions): void {
        toast.info(message, { ...this.defaultOptions, ...options });
    }

    static warning(message: string, options?: ToastOptions): void {
        toast.warning(message, { ...this.defaultOptions, ...options });
    }

    static custom(message: string, options?: ToastOptions): void {
        toast(message, { ...this.defaultOptions, ...options });
    }
}

export default Toast;