import { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate back to safety
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-1">
              An unexpected error occurred on this page.
            </p>
            {this.state.error && (
              <pre className="mt-3 text-xs text-left bg-muted/60 rounded p-3 overflow-x-auto text-destructive whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              Go back
            </Button>
            <Button onClick={() => { window.location.href = "/dashboard"; }}>
              Back to dashboard
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
