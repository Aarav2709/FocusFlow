# FocusFlow Desktop v4.0.0 Release Notes

> Published: 2025-10-07

## 🚀 Highlights

- **Minimalist home experience** — A clean, distraction-free timer interface that lets you focus on what matters most: your study session.
- **Comprehensive stats dashboard** — All your analytics, charts, and insights live in a dedicated Stats page with full-width visualizations.
- **D-Day countdown tracking** — Set your exam or event target date and watch the countdown motivate you every day, editable directly from your profile.
- **Streamlined analytics** — Single-row activity heatmap that uses full width, cleaner chart layouts, and focused performance metrics.

## ✨ Features

- **Clean Home Page** — Removed all metrics and charts from home; now it's just your timer, keeping you focused and present.
- **D-Day Target Date** — Track days until your important exam or event with a countdown that shows D-390 (future), D-DAY! (today), or D+5 (past).
- **Editable D-Day in Profile** — Set and update your target date anytime from the Profile settings with a clean date picker dialog.
- **Dedicated Stats Page** — All analytics, visualizations, and insights moved to a proper Stats page with better organization and breathing room.
- **Full-Width Activity Heatmap** — 30-day calendar view in a single row that stretches across the full width for better visibility.
- **Suppressed DevTools Noise** — Eliminated harmless Autofill console warnings for a cleaner development experience.

## 🛠️ Improvements & Fixes

- Removed XP/Level/Season gamification system from home page for a cleaner, more professional interface.
- Removed Daily Focus, Daily Average, and Study Streak metric cards from home to eliminate clutter.
- Removed bar charts and subject distribution visualizations from home page.
- Renamed "Advanced Analytics" to simply "Stats" for clarity.
- Redesigned activity heatmap from multi-row weekly grid to single-row full-width layout.
- Fixed heatmap box sizing to be responsive yet constrained (max 50px) for optimal viewing.
- Centered heatmap grid and improved hover interactions with subtle scale effects.
- Updated ProfileContext with default D-Day date (November 1, 2026) and full persistence support.
- Added date validation in profile editor to ensure proper ISO format (YYYY-MM-DD).

## 🧪 Quality Checks

- `npm run build:ts` passes across shared, main, and renderer TypeScript projects.
- `npm run build` compiles the production bundles and runs the Electron native module rebuild script.
- Electron Builder smoke test confirms the packaged app launches on Windows after the native rebuild step.
- All editable profile fields (nickname, country, status, daily target, D-Day date) tested and working.

## 📦 Obtaining the Release

Download the assets attached to the GitHub release tagged `v4.0.0`:

- **Windows:** `FocusFlow.exe` (NSIS installer)
- **macOS:** Universal `.dmg` plus zipped app bundle for notarization workflows.
- **Linux:** `.AppImage` and `.zip` builds for x64 distributions.

## 🔁 Upgrade Notes

- Existing local data, including historical focus totals and subjects, continues to live in the Electron `userData` directory.
- If you installed any earlier FocusFlow builds, uninstall them before installing `v4.0.0` to avoid duplicate shortcuts or icons.
- New D-Day field will default to November 1, 2026 for existing profiles; update it from Profile settings.
- Stats page now requires navigation from the bottom nav bar instead of appearing on home.

## ⚠️ Known Issues

- Auto-update remains unavailable—future versions must be installed manually.
- Some Linux distributions may require running `chmod +x FocusFlow.AppImage` after download.
- Exporting very large local datasets can briefly freeze the UI; background export remains on the roadmap.

## 🙌 Thanks

Thank you to every focused student who values simplicity and clarity in their study tools. Version `v4.0.0` strips away the noise and puts your attention where it belongs—on the work itself. Stay focused and crush those goals! 🎯
