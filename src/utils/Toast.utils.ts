import { CloseButton, toast, ToastOptions } from "react-toastify";

class CustomToast {
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

  private static glassStyle: React.CSSProperties = {
    
    background: "rgba(255, 255, 255, 0.2)", // Semi-transparent white
    backdropFilter: "blur(10px)", // Frosted glass effect
    WebkitBackdropFilter: "blur(10px)", // For Safari support
    borderRadius: "10px", // Rounded corners
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
    border: "0.5px solid rgba(0, 0, 0, 0.3)", // Subtle border
    cursor: "pointer", // Pointer cursor
  };

  // Merges glass style with other options if 'glass' flag is true
  private static mergeOptions(options?: ToastOptions, glass?: boolean): ToastOptions {
    const finalOptions = { ...options,closeButton:false, hideProgressBar: true, pauseOnHover: true, draggable: true };
    if (glass) {
      finalOptions.style = { ...this.glassStyle, ...(options?.style || {}) };
    }
    return finalOptions;
  }

  static success(message: string, options?: ToastOptions, glass: boolean = false): void {
    toast.success(message, this.mergeOptions(options, glass));
  }

  static error(message: string, options?: ToastOptions, glass: boolean = false): void {
    toast.error(message, this.mergeOptions(options, glass));
  }

  static info(message: string, options?: ToastOptions, glass: boolean = false): void {
    toast.info(message, this.mergeOptions(options, glass));
  }

  static warning(message: string, options?: ToastOptions, glass: boolean = false): void {
    toast.warning(message, this.mergeOptions(options, glass));
  }

  static custom(message: string, options?: ToastOptions, glass: boolean = false): void {
    toast(message, this.mergeOptions(options, glass));
  }
}

export default CustomToast;
