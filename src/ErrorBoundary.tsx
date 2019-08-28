import * as React from "react";

type ErrorProps = {}

type ErrorState = {
  hasError: boolean,
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  constructor(props : any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error : Error) {
    console.log("error", error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <><h1>An error occured</h1><p>Check the console for details</p></>;
    }

    return this.props.children;
  }
}
