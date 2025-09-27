// Shim for RefreshRuntime to prevent HMR errors
if (typeof window !== 'undefined') {
  (window as any).$RefreshReg$ = () => {};
  (window as any).$RefreshSig$ = () => (type: any) => type;
  
  // Also handle global RefreshRuntime
  if (!(window as any).RefreshRuntime) {
    (window as any).RefreshRuntime = {
      register: () => {},
      createSignatureFunctionForTransform: () => () => {},
    };
  }
}