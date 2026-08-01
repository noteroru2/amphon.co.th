# Final code cleanup — git baseline

Recorded at start of F-12 Final Cleanup (no SHA guessed).

| Field | Value |
| --- | --- |
| current_main_sha / Latest main tip | `291e530f8e512899b72eedc26b4fe8b0c29da0c4` |
| origin_main_sha | `291e530f8e512899b72eedc26b4fe8b0c29da0c4` |
| Working tree | Dirty unrelated: batch regression JSON mods + untracked scratch/docs (left alone) |
| pre_phase_a_sha | `ff6f453b0dc1a059d8c13fbf0fa365755d05315b` (`docs(seo): fill batch 12g-1 report-only SHA`) |
| phase_a_implementation_sha | `8bf095f3951d726e53f608ad9640873a58f2da2d` (`fix(routing): prepare host-aware www redirects`) |
| phase_a_merge_sha | `84f083b57bb523310e763b986bc986d33cbb96e5` (`merge: prepare F-12 host-aware redirects`) |
| phase_a_handoff_docs_sha | `8b8520f80b3d6ee8dbcae08a71c3a0314d08337c` |
| cutover_failure_docs_sha | `7afc47364eb76a93b0456576e658c6a5117609bb` |
| post_rollback_docs_sha | `291e530f8e512899b72eedc26b4fe8b0c29da0c4` |

## Diff classification `ff6f453..HEAD`

| Path | Class |
| --- | --- |
| `vercel.json` | **F12_RUNTIME_CHANGE** |
| `scripts/generate-f12-www-redirects.mjs` | **F12_RUNTIME_CHANGE** (generator) |
| `scripts/check-f12-vercel-host-redirect.mjs` | **F12_QA_CHANGE** |
| `package.json` (`qa:f12-vercel-host-redirect`) | **F12_QA_CHANGE** |
| `scripts/check-batch-7-host-redirects.mjs` | **F12_QA_CHANGE** (expectation inverted for Phase A) |
| `scripts/lib/site-audit.mjs` | **F12_RUNTIME_CHANGE** / QA support (ignore `has` host rules; 307 permanence) |
| `docs/f12-vercel-json-host-redirect/*` | **F12_DOCUMENTATION** — **RETAIN** |

No **UNRELATED_CHANGE** in the F-12 commit range above (unrelated dirty worktree files are outside this diff).

## Gate

```text
Phase A runtime code present: YES
Only documentation remains: NO
→ Case B — code rollback required
```
