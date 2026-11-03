# Donka editor dependency patch

Based on upstream tag `@gorules/jdm-editor@1.52.0`. The package keeps the editor's source and
public interface, with Zod upgraded from 3 to 4 to remove a high-severity dependency finding
(DNK-49). `1.52.0-donka.1` distinguishes the patched package from the upstream npm release.

The existing optimized WASM and grammar builds remain prerequisites. After installing with
pnpm 10, run:

```bash
pnpm build
pnpm typecheck
pnpm --filter @gorules/jdm-editor test:schemas
pnpm --filter @gorules/jdm-editor pack --pack-destination /path/to/artifacts
```

Schema tests cover existing graph defaults, dynamic table cells, unknown-node compatibility,
invalid built-in nodes, edges and column enums. Studio's type, build and live feature tests
must also pass against the packed dependency before its product PR merges.

Distribute this fork's package as a GitHub prerelease asset with its source commit and SHA-256
recorded in the release notes. Do not publish it under the upstream npm namespace. Studio's
lockfile records the artifact integrity. Keep the included upstream MIT licence unchanged.
