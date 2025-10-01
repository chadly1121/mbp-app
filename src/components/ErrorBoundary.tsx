import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary fallbackRender={({ error }) => <pre>App error: {error.message}</pre>}>
      {children}
    </ReactErrorBoundary>
  );
}

export { ErrorBoundary };