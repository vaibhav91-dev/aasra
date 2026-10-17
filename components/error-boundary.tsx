"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card error-boundary-card" role="alert" style={{ margin: "24px 0", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", color: "var(--red, #b91c1c)" }}>
            <AlertTriangle size={24} aria-hidden="true" />
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
              {this.props.fallbackTitle ?? "Something went wrong"}
            </h2>
          </div>
          <p className="muted" style={{ marginBottom: "16px" }}>
            {this.props.fallbackMessage ??
              "An unexpected error occurred. Please reload to resume your session safely."}
          </p>
          <button
            type="button"
            className="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
