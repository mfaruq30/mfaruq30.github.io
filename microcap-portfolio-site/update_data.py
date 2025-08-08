# Updates portfolio.json last_price fields using yfinance and commits changes.
import json, os, sys, datetime, pytz
import yfinance as yf

PORTFOLIO_FILE = "portfolio.json"
HISTORY_FILE = "history.json"

def get_last_price(symbol):
    try:
        t = yf.Ticker(symbol)
        hist = t.history(period="1d", interval="1d")
        if not hist.empty:
            return float(hist["Close"].iloc[-1])
        finfo = getattr(t, "fast_info", None)
        if finfo and "last_price" in finfo:
            return float(finfo["last_price"])
    except Exception as e:
        print(f"Error fetching {symbol}: {e}", file=sys.stderr)
    return None

def compute_totals(data):
    total_value = 0.0
    cash_value = 0.0
    total_cost = 0.0
    for h in data["holdings"]:
        if h.get("symbol") == "CASH":
            cash_value += float(h.get("amount", 0))
            continue
        sh = float(h.get("shares", 0))
        last_px = float(h.get("last_price", 0))
        avg_cost = float(h.get("avg_cost", 0))
        total_value += sh * last_px
        total_cost += sh * avg_cost
    gross = total_value + cash_value
    return gross, total_value, cash_value, total_cost

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_history(hist):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(hist, f, indent=2)

def main():
    tz = pytz.timezone("America/New_York")
    today = datetime.datetime.now(tz).strftime("%Y-%m-%d")

    with open(PORTFOLIO_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    changed = False
    for h in data["holdings"]:
        sym = h.get("symbol")
        if sym and sym != "CASH":
            px = get_last_price(sym)
            if px is not None and abs(px - float(h.get("last_price", 0))) > 1e-6:
                h["last_price"] = round(px, 4)
                changed = True

    data["updated_at"] = datetime.datetime.now(tz).strftime("%Y-%m-%d %H:%M %Z")

    # Compute total & append to history if not already for today
    gross, total_value, cash_value, total_cost = compute_totals(data)
    hist = load_history()
    if not hist or hist[-1].get("ts") != today:
        hist.append({"ts": today, "total_value": round(gross, 2)})
        save_history(hist)
        changed = True  # ensure we commit new history point

    # Always write portfolio.json (to update timestamp)
    with open(PORTFOLIO_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    if changed:
        print(f"Portfolio updated. Total=${gross:.2f}")
    else:
        print("No price changes, timestamp/history updated.")

if __name__ == "__main__":
    main()
