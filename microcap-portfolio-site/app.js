async function loadPortfolio() {
  const res = await fetch('portfolio.json', { cache: 'no-store' });
  const data = await res.json();

  const holdingsEl = document.getElementById('holdings');
  holdingsEl.innerHTML = '';

  const cashItem = data.holdings.find(h => h.symbol === 'CASH');
  const nonCash = data.holdings.filter(h => h.symbol !== 'CASH');

  // compute totals
  let totalValue = 0;
  let totalCost = 0;
  nonCash.forEach(h => {
    const value = h.shares * h.last_price;
    const costBasis = h.shares * h.avg_cost;
    totalValue += value;
    totalCost += costBasis;
  });
  const cashValue = cashItem ? cashItem.amount : 0;
  const grossValue = totalValue + cashValue;
  const pl = totalValue - totalCost;

  // Summary
  document.getElementById('portfolioValue').textContent = `$${grossValue.toFixed(2)}`;
  const plEl = document.getElementById('portfolioPL');
  const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0;
  plEl.textContent = `${pl >= 0 ? '+' : ''}${pl.toFixed(2)} (${plPct.toFixed(2)}%)`;
  plEl.className = 'pl ' + (pl >= 0 ? 'ok' : 'bad');
  document.getElementById('cashValue').textContent = `$${cashValue.toFixed(2)}`;

  // Cards
  nonCash.forEach(h => {
    const value = h.shares * h.last_price;
    const allocPct = grossValue > 0 ? (value / grossValue) * 100 : 0;
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="row">
        <div class="name">${h.name}</div>
        <div class="badge">${h.shares} sh</div>
      </div>
      <div class="row">
        <div class="ticker">${h.symbol}</div>
        <div class="value">$${value.toFixed(2)}</div>
      </div>
      <div class="row">
        <div class="ticker">Last</div>
        <div>$${h.last_price.toFixed(2)}</div>
      </div>
      <div class="row">
        <div class="ticker">Avg Cost</div>
        <div>$${h.avg_cost.toFixed(2)}</div>
      </div>
      <div class="bar"><div style="width:${allocPct.toFixed(2)}%"></div></div>
      <div class="kv">
        <div><label>Stop</label><div>${h.stop ? ('$' + h.stop.toFixed(2)) : '—'}</div></div>
        <div><label>Catalyst</label><div>${h.catalyst || '—'}</div></div>
      </div>
      <div class="kv">
        <div style="grid-column: 1 / -1;"><label>Notes</label><div>${h.notes || '—'}</div></div>
      </div>
    `;

    holdingsEl.appendChild(card);
  });

  const updatedAt = document.getElementById('updatedAt');
  updatedAt.textContent = `Last updated: ${data.updated_at || '—'}`;

  document.getElementById('year').textContent = new Date().getFullYear();
}

loadPortfolio();
loadHistoryAndChart();


async function loadHistoryAndChart(startValue) {
  try {
    const res = await fetch('history.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('history.json not found yet');
    const hist = await res.json(); // [{ts, total_value}]

    const labels = hist.map(p => p.ts);
    const values = hist.map(p => p.total_value);

    const ctx = document.getElementById('portfolioChart').getContext('2d');
    // eslint-disable-next-line no-undef
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Portfolio Value ($)',
          data: values,
          fill: false,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true }
        },
        scales: {
          x: { ticks: { maxRotation: 0 } },
          y: { beginAtZero: false }
        }
      }
    });
  } catch (e) {
    console.warn('No history yet. Chart will appear after first workflow run.', e);
  }
}
