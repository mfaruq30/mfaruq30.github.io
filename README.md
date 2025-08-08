# Micro‑Cap Portfolio Site (Static + Auto Price Updates)

This is a minimalist, modern portfolio site (static front‑end) that reads data from `portfolio.json`. A GitHub Actions workflow updates prices daily after market close using `yfinance`, so you don't need a server or API keys.

## What’s inside
- `index.html` – the site
- `style.css` – styles (dark, modern)
- `app.js` – renders holdings from `portfolio.json`
- `portfolio.json` – your portfolio (shares, avg cost, last price, notes)
- `.github/workflows/update.yml` – scheduled job to update prices (weekdays, 20:30 UTC)
- `update_data.py` – Python script run by the workflow

## Quick start
1. Create a new GitHub repository named **`YOURUSERNAME.github.io`** (replace with your GitHub username).
2. Upload **all files** in this folder to the root of the repo (keep the `.github/workflows` path).
3. Enable GitHub Pages (if needed): Settings → Pages → Source: `Deploy from a branch`, branch: `main` (or `master`), folder: `/root`.
4. Visit `https://YOURUSERNAME.github.io` to see the site.
5. The scheduled workflow will update `portfolio.json` after market close on weekdays (20:30 UTC). You can also run it manually from the **Actions** tab (Workflow Dispatch).

## Editing holdings
Open `portfolio.json` and edit your positions (symbol, shares, avg_cost, stop, catalyst, notes). Keep a CASH entry for reserve if you want. Do **not** remove fields like `last_price` — the workflow updates them.

## FAQ
**Do I need a backend?** No. GitHub Pages serves static files. The "backend" is simulated with GitHub Actions that writes updated prices into `portfolio.json` daily.

**Live intraday prices?** This setup updates after close. For intraday, consider serverless functions on Vercel/Netlify/Cloudflare Workers with a paid/free API (Alpha Vantage, Finnhub, IEX, etc.) and proxy your API key.

**Robinhood integration?** Robinhood has no official public API for quotes/positions. Easiest is to manage holdings here manually and let the workflow fetch public prices.

**Development**
If you clone locally:
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r <(echo yfinance pytz)
python update_data.py
```

Enjoy! 🚀


## Performance chart
- The workflow writes a daily total value to `history.json` after market close.
- `index.html` loads `history.json` and renders a line chart with Chart.js.
- You will see the chart after the first workflow run (or run it manually from **Actions → Update Portfolio Prices → Run workflow**).

## Super simple publish steps (GitHub web UI)
1) **Download** the ZIP from ChatGPT and extract it on your computer.  
2) On GitHub, click **New repository** and name it **YOURUSERNAME.github.io** (exactly).  
3) Click **Upload files** and drag-drop the **contents** of the folder (keep `.github/workflows/update.yml` path intact). Click **Commit changes**.  
4) Go to the repo **Settings → Pages**. For user sites, it should auto-enable on the **main** branch. Wait 1–3 minutes.  
5) Visit `https://YOURUSERNAME.github.io` to see the site.  
6) Click the **Actions** tab, open **Update Portfolio Prices**, and **Run workflow** once to seed prices and the chart. (Then it runs automatically on weekdays after close.)

If you see a 404 at first, wait a minute and refresh. If Actions are disabled, enable them under **Settings → Actions**.
