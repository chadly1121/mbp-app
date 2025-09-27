import React, { useState } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [err, setErr] = useState<Error | null>(null)
  return err ? <pre>App error: {err.message}</pre> : (
    <ReactErrorBoundary fallbackRender={({ error }) => <pre>App error: {error.message}</pre>}>
      {children}
    </ReactErrorBoundary>
  )
}

export { ErrorBoundary };