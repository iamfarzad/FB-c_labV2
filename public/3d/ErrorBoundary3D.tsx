import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary3D extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in 3D component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Something went wrong with the 3D model.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary3D; 