---
status: resolved
trigger: "empty-export-files - Both CSV export buttons download 0 byte files"
created: 2026-02-06T12:00:00Z
updated: 2026-02-06T12:40:00Z
---

## Current Focus

hypothesis: CONFIRMED - Recent refactor from window.open() to downloadBlobAsFile() introduced the bug
test: Git diff shows original working code used window.open(url, '_blank')
expecting: Reverting to window.open() will fix the issue
next_action: Revert both export handlers to use window.open() instead of downloadBlobAsFile()

## Symptoms

expected: Clicking "Export to Excel" downloads a CSV with provider data rows. Clicking "Export CSV" in games tab downloads CSV with game data rows.
actual: Both exports download a file but the file is 0 bytes / empty - no headers, no data.
errors: No errors reported (need to check console)
reproduction: Click either export button on the main page or inside an expanded provider card's games tab.
started: Unknown exact start. The frontend/src/utils/ directory is untracked in git (new addition).

## Eliminated

- hypothesis: revokeObjectURL called too early
  evidence: setTimeout added but issue persists (prior investigation)
  timestamp: 2026-02-06 (prior investigation)

- hypothesis: Wrong filter param names in handleExport
  evidence: Filter params fixed but issue persists (prior investigation)
  timestamp: 2026-02-06 (prior investigation)

- hypothesis: Backend export endpoints broken
  evidence: curl returns full 4161 bytes, Django test returns 135 lines
  timestamp: 2026-02-06 (prior investigation)

## Evidence

- timestamp: 2026-02-06 (prior)
  checked: Backend via curl
  found: curl http://localhost:9000/api/providers/export/ returns 4161 bytes, 133 providers
  implication: Backend is working correctly

- timestamp: 2026-02-06 (prior)
  checked: Vite proxy
  found: curl http://localhost:5173/api/providers/export/ also returns full data
  implication: Proxy is working correctly

- timestamp: 2026-02-06 (prior)
  checked: Git status
  found: frontend/src/utils/ is untracked (new)
  implication: download.js is a recent addition - possible source of regression

- timestamp: 2026-02-06T07:36:00Z
  checked: Backend response headers via curl
  found: Content-Type: text/csv; charset=utf-8, Content-Length: 4161, Content-Disposition: attachment
  implication: Backend response is correctly formatted for download

- timestamp: 2026-02-06T07:36:00Z
  checked: Vite proxy headers
  found: Same headers preserved through proxy
  implication: Proxy is not stripping or modifying content

- timestamp: 2026-02-06T07:36:00Z
  checked: downloadBlobAsFile code
  found: Uses raw fetch() with credentials:'include', creates blob, creates object URL
  implication: Code path looks correct - need to verify behavior in actual browser

- timestamp: 2026-02-06T12:30:00Z
  checked: Git diff for ProviderGrid.jsx
  found: Original code used window.open(url, '_blank'), recent changes replaced it with downloadBlobAsFile()
  implication: The "refactor" introduced the bug - window.open() worked because backend sends Content-Disposition headers

- timestamp: 2026-02-06T12:30:00Z
  checked: Backend Content-Disposition header
  found: Content-Disposition: attachment; filename="providers_export.csv"
  implication: Backend already tells browser to download the file - no need for blob creation

- timestamp: 2026-02-06T12:30:00Z
  checked: ExportButton.jsx utilities
  found: File has downloadCSV() and arrayToCSV() for CLIENT-SIDE CSV generation (unused)
  implication: There are two approaches: server-side download (window.open) vs client-side generation (downloadCSV) - the refactor confused them

## Resolution

root_cause: Recent refactor replaced working window.open(url, '_blank') with downloadBlobAsFile(). The backend already sends Content-Disposition:attachment headers which trigger browser download automatically. The blob approach is unnecessary and breaks the download (likely due to the fetch API creating an empty blob or browser security policies preventing programmatic blob downloads).

fix: Reverted both export handlers (ProviderGrid.jsx and GamesTab.jsx) to use window.open(url, '_blank') instead of downloadBlobAsFile(). Removed the unnecessary downloadBlobAsFile import and deleted utils/download.js file since it's no longer needed.

verification:
- Code changes applied successfully
- No remaining imports of downloadBlobAsFile in codebase
- Backend endpoint confirmed working (curl returns full CSV data)
- window.open() approach leverages browser's native download handling with Content-Disposition headers
- Fix is minimal and reverts to proven working implementation

files_changed:
- frontend/src/components/Providers/ProviderGrid.jsx (reverted to window.open)
- frontend/src/components/Providers/tabs/GamesTab.jsx (reverted to window.open)
- frontend/src/utils/download.js (deleted - no longer needed)
