useEffect(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
}, []);
import React, { useState, useEffect, useMemo } from "react";

const SETUPS = [
  "Fractal",
  "Rejection Block",
  "Breakout",
  "Structure Break (BOS)",
  "Liquidity Sweep",
];

export default function App() {
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem("cryptoJournalTrades");
    return saved ? JSON.parse(saved) : [];
  });

  const [filterSetup, setFilterSetup] = useState("All");

  const [form, setForm] = useState({
    date: "",
    pair: "",
    direction: "Long",
    entry: "",
    exit: "",
    risk: "",
    setup: "Fractal",
  });

  useEffect(() => {
    localStorage.setItem("cryptoJournalTrades", JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  const addTrade = () => {
    if (!form.date || !form.pair || !form.entry || !form.exit) return;

    const entry = parseFloat(form.entry);
    const exit = parseFloat(form.exit);
    const risk = parseFloat(form.risk || 0);

    const pnl = form.direction === "Long" ? exit - entry : entry - exit;
    const rr = risk ? pnl / risk : 0;

    const newTrade = {
      id: Date.now(),
      ...form,
      pnl,
      rr,
    };

    setTrades([...trades, newTrade]);
    setForm({
      date: "",
      pair: "",
      direction: "Long",
      entry: "",
      exit: "",
      risk: "",
      setup: "Fractal",
    });
  };

  const filteredTrades = useMemo(() => {
    if (filterSetup === "All") return trades;
    return trades.filter((t) => t.setup === filterSetup);
  }, [trades, filterSetup]);

  const totalPnL = filteredTrades
    .reduce((acc, t) => acc + t.pnl, 0)
    .toFixed(2);

  const winRate = filteredTrades.length
    ? (
        (filteredTrades.filter((t) => t.pnl > 0).length /
          filteredTrades.length) *
        100
      ).toFixed(1)
    : 0;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Crypto Trading Journal</h2>

      <div style={{ marginBottom: 20 }}>
        <select
          value={filterSetup}
          onChange={(e) => setFilterSetup(e.target.value)}
        >
          <option>All</option>
          {SETUPS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
        <input type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input placeholder="Pair" value={form.pair}
          onChange={(e) => setForm({ ...form, pair: e.target.value })} />

        <select value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value })}>
          <option>Long</option>
          <option>Short</option>
        </select>

        <input placeholder="Entry" type="number"
          value={form.entry}
          onChange={(e) => setForm({ ...form, entry: e.target.value })} />

        <input placeholder="Exit" type="number"
          value={form.exit}
          onChange={(e) => setForm({ ...form, exit: e.target.value })} />

        <input placeholder="Risk"
          type="number"
          value={form.risk}
          onChange={(e) => setForm({ ...form, risk: e.target.value })} />

        <select value={form.setup}
          onChange={(e) => setForm({ ...form, setup: e.target.value })}>
          {SETUPS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button onClick={addTrade}>Add Trade</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Total PnL:</strong> {totalPnL} <br />
        <strong>Win Rate:</strong> {winRate}%
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Date</th>
            <th>Pair</th>
            <th>Setup</th>
            <th>PnL</th>
          </tr>
        </thead>
        <tbody>
          {filteredTrades.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.pair}</td>
              <td>{t.setup}</td>
              <td>{t.pnl.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}