import React, { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when error is caught
      return (
        <div style={{ position: 'absolute', top: 0, width: '100%', background: 'red', color: 'white', padding: '10px', textAlign: 'center' }}>
          Something went wrong. Please reload the page.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
