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
    size: "",
    setup: "Fractal",
  });

  useEffect(() => {
    localStorage.setItem("cryptoJournalTrades", JSON.stringify(trades));
  }, [trades]);

  const addTrade = () => {
    if (!form.date || !form.pair || !form.entry || !form.exit || !form.size) return;

    const entry = parseFloat(form.entry);
    const exit = parseFloat(form.exit);
    const size = parseFloat(form.size);

    const pnl =
      form.direction === "Long"
        ? (exit - entry) * size
        : (entry - exit) * size;

    const newTrade = {
      id: Date.now(),
      ...form,
      pnl,
    };

    setTrades([...trades, newTrade]);

    setForm({
      date: "",
      pair: "",
      direction: "Long",
      entry: "",
      exit: "",
      size: "",
      setup: "Fractal",
    });
  };

  const deleteTrade = (id) => {
    setTrades(trades.filter((t) => t.id !== id));
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
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          placeholder="Pair"
          value={form.pair}
          onChange={(e) => setForm({ ...form, pair: e.target.value })}
        />

        <select
          value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value })}
        >
          <option>Long</option>
          <option>Short</option>
        </select>

        <input
          placeholder="Entry"
          type="number"
          value={form.entry}
          onChange={(e) => setForm({ ...form, entry: e.target.value })}
        />

        <input
          placeholder="Exit"
          type="number"
          value={form.exit}
          onChange={(e) => setForm({ ...form, exit: e.target.value })}
        />

        <input
          placeholder="Position Size"
          type="number"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />

        <select
          value={form.setup}
          onChange={(e) => setForm({ ...form, setup: e.target.value })}
        >
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
            <th>Size</th>
            <th>PnL</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredTrades.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.pair}</td>
              <td>{t.setup}</td>
              <td>{t.size}</td>
              <td>{t.pnl.toFixed(2)}</td>
              <td>
                <button onClick={() => deleteTrade(t.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}