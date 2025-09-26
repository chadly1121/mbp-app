import React from 'react';

type Props = { children: React.ReactNode, fallback?: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error('ErrorBoundary caught', err); }
  render() { return this.state.hasError ? (this.props.fallback ?? null) : this.props.children; }
}