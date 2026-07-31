# Environment baseline — Batch 3

Captured on the Windows machine used to reproduce F-08.

## Commands

| Check | Result |
| --- | --- |
| `where node` | `C:\Program Files\nodejs\node.exe` |
| `where npm` | `C:\Program Files\nodejs\npm.cmd` (+ roaming shims) |
| `node --version` | `v22.20.0` |
| `npm --version` | `11.8.0` |
| `process.execPath` | `C:\Program Files\nodejs\node.exe` |
| `process.platform` | `win32` |
| `process.arch` | `x64` |
| `npm config get cache` | Cursor sandbox npm cache under `%LOCALAPPDATA%\Temp\cursor-sandbox-cache\...` (session-specific) |
| `npm config get prefix` | `C:\Users\User\AppData\Roaming\npm` |

## Host

| Item | Value |
| --- | --- |
| Windows | Microsoft Windows NT 10.0.26200.0 |
| PowerShell | 5.1.26100.8875 |
| Shell used for primary repro | PowerShell |
| CPU | AMD Ryzen 9 5900HS |
| Memory | ~31.4 GB |
| Node install source | Official Node.js installer under `C:\Program Files\nodejs` (no nvm/volta detected) |

## Repository path

| Item | Value |
| --- | --- |
| Path | `C:\Users\User\Desktop\project ทั้งหมด\amphon.co.th` |
| Contains Thai characters | Yes |
| Contains spaces | Yes |
| OneDrive Desktop reparse | Not a reparse point (`fsutil` error 4390) |

## Project Node constraints

| Source | Value |
| --- | --- |
| `package.json` engines | `>=22.12.0` |
| `.nvmrc` / `.node-version` | Not present |
| Lockfile | `package-lock.json` (npm) |
| Production (Vercel) | Linux ASCII checkout path; Node engine `>=22.12.0` |

## Relevant env (non-secret)

| Variable | Notes |
| --- | --- |
| `npm_config_devdir` | Present via Cursor tooling; produces `npm warn Unknown env config "devdir"` noise only |
| `NODE_OPTIONS` | Cleared after diagnostic runs |

No tokens or credentials recorded.
