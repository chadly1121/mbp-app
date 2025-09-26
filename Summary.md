# Batch 0 — Bootstrap

**Added**: ESLint flat config, Prettier config, Vitest config+setup, Deno project config, CI workflow  
**Updated**: package.json scripts (if editable)  
**Security**: npm audit in CI; Deno lint/fmt  
**Quality gates**: lint, types, tests, build, coverage≥70  

## Read-only constraints

The following files could not be auto-edited and require manual updates:

### .lovable/policy.yml
**Desired content:**
```yaml
style:
  js_ts: { formatter: prettier, linter: eslint:recommended }
  deno:  { formatter: deno-fmt, linter: deno-lint }
quality_gates:
  max_diff_lines: 400
  require_tests: true
  require_types: true
  coverage_min: 70
security:
  scans: [npm-audit]
automation:
  triggers:
    - push: [main]
    - schedule: nightly
paths:
  include: [src, supabase/functions, scripts]
  exclude: [node_modules, .venv, dist, build, .next, coverage, generated, supabase/.temp]
```

### package.json scripts
**Desired additions/updates:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build", 
    "preview": "vite preview --port 8080",
    "lint": "eslint .",
    "format": "prettier -w .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest",
    "test:ci": "vitest run --reporter=dot",
    "gen:types": "supabase gen types typescript --project-id qdrcpflmnxhkzrlhdhda > src/lib/database.types.ts"
  }
}
```

### tsconfig.json 
**Desired tightened configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

**Next**: Batch 1 — incremental refactors, ≤400 LOC/commit