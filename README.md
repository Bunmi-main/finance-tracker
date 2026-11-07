# 💰 VaultFlow — Personal Finance Dashboard

A clean, responsive, single-page personal finance tracker built entirely with vanilla web technologies.

![VaultFlow Dashboard](screenshot.png) <!-- optional preview -->

---

## ⚡ Highlights

- **Single-Page Dashboard**: Instant startup with no landing homepage, onboarding flow, or authentication barriers.
- **100% Offline & Private**: All data resides strictly in your browser's Web Storage (`localStorage`).
- **Zero External Dependencies**: Pure Vanilla HTML5, CSS3, and modern JavaScript (ES6+).
- **Zero CSS Variables**: Engineered cleanly using explicit design tokens and color schemes.
- **High-DPI Canvas Visualizations**:
  - **Cash Flow Dynamics**: Multi-month grouped bar chart (Income vs. Expense) with interactive hover tooltips.
  - **Expense Allocation Donut Chart**: Dynamic category percentage ring with live legend breakdowns.
- **Budget Threshold Tracking**: Monthly category limits with real-time green/warning/danger progress meters.
- **Savings Vaults & Target Goals**: Track milestones (Emergency Fund, Travel, Tech) with one-click deposits.
- **Comprehensive Transaction Ledger**:
  - Fast search across descriptions, categories, amounts, and notes.
  - Type filter tabs (*All*, *Income*, *Expense*).
  - Dynamic category selector and multi-mode sorting (*Newest*, *Oldest*, *Highest*, *Lowest*).
  - Clean pagination controls and quick inline edit/delete actions.
- **Data Portability**:
  - Export transactions to standard CSV (UTF-8 Excel-ready).
  - Download full JSON backup snapshots.
  - Restore backups via file picker.
  - Load demo dataset or wipe data anytime.
- **Global Currency Switcher**: Real-time formatting for USD (`$`), EUR (`€`), GBP (`£`), JPY (`¥`), CAD (`C$`), AUD (`A$`), and INR (`₹`).

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser:

```bash
# On Windows
start index.html

# On macOS
open index.html

# On Linux
xdg-open index.html
```

Or serve with any static HTTP server:

```bash
npx serve .
```

---

## 🛠️ Tech Stack

- **Markup**: HTML5 Semantic Structure
- **Styling**: Vanilla CSS3 (Flexbox, CSS Grid, Media Queries)
- **Scripting**: Vanilla JavaScript (Canvas API, Web Storage API, Blob API)
