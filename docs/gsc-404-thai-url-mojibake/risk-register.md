# Risk register

| ID | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | Percent-encoding all 219 Thai destinations changes `vercel.json` broadly | P1 | Dedicated Fix F batch; QA Batch 1 + 7 + redirect-chain; rollback = git revert |
| R2 | Absolute vs relative Location behavior differs | P2 | Prefer `https://amphon.co.th` + percent path in destinations |
| R3 | Restoring retired province routes reopens cannibalization | P1 | Do **not** RESTORE_200 for HDD/GoPro/Lens provinces |
| R4 | Blog → `/blog` weakens informational intent | P2 | Owner decision before any change |
| R5 | Redirecting lens provinces to hub that was historically “noindex legacy” | P2 | Current hub `/บริการ/รับซื้อเลนส์กล้อง` validated 200 + sitemap + self-canonical |
| R6 | Mis-classifying as GSC stale without encoding fix | P1 | Avoid Validate-only until Location is ASCII/percent |
| R7 | Touching F-12 / www domain settings | P3 | Out of scope — do not combine |
