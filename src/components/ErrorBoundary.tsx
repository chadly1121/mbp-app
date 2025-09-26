import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: "#b91c1c" }}>
          <h2>Oops. A runtime error occurred.</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error.message)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}