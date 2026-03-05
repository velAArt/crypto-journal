import React, { useEffect, useMemo, useState } from "react";

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
    size: "", // позиция (кол-во монет)
    setup: "Fractal",
  });

  // Telegram WebApp (не обязательно, но полезно)
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  // autosave
  useEffect(() => {
    localStorage.setItem("cryptoJournalTrades", JSON.stringify(trades));
  }, [trades]);

  const addTrade = () => {
    if (!form.date || !form.pair || !form.entry || !form.exit || !form.size) return;

    const entry = Number(form.entry);
    const exit = Number(form.exit);
    const size = Number(form.size);

    if (!Number.isFinite(entry) || !Number.isFinite(exit) || !Number.isFinite(size)) return;

    // PnL в валюте котировки (обычно USDT), если size = количество монет
    const pnl =
      form.direction === "Long"
        ? (exit - entry) * size
        : (entry - exit) * size;

    const newTrade = {
      id: Date.now(),
      ...form,
      pnl,
    };

    setTrades((prev) => [newTrade, ...prev]);

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
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTrades = useMemo(() => {
    if (filterSetup === "All") return trades;
    return trades.filter((t) => t.setup === filterSetup);
  }, [trades, filterSetup]);

  const totalPnL = useMemo(() => {
    return filteredTrades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0).toFixed(2);
  }, [filteredTrades]);

  const winRate = useMemo(() => {
    const total = filteredTrades.length;
    if (!total) return "0.0";
    const wins = filteredTrades.filter((t) => (Number(t.pnl) || 0) > 0).length;
    return ((wins / total) * 100).toFixed(1);
  }, [filteredTrades]);

  // -------- Styles (фикс для Telegram: белый фон, чёрный текст) --------
  const pageStyle = {
    padding: 16,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffffff",
    color: "#111111",
    minHeight: "100vh",
  };

  const boxStyle = {
    border: "1px solid #d0d0d0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#ffffff",
  };

  const inputStyle = {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #cfcfcf",
    backgroundColor: "#ffffff",
    color: "#111111",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #111111",
    backgroundColor: "#111111",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    color: "#111111",
  };

  const thStyle = {
    textAlign: "left",
    padding: 10,
    borderBottom: "1px solid #d0d0d0",
    backgroundColor: "#f6f6f6",
    color: "#111111",
    fontWeight: 700,
    fontSize: 13,
  };

  const tdStyle = {
    padding: 10,
    borderBottom: "1px solid #eeeeee",
    color: "#111111",
    fontSize: 13,
    verticalAlign: "top",
  };

  const dangerBtnStyle = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #c33",
    backgroundColor: "#fff",
    color: "#c33",
    cursor: "pointer",
    fontWeight: 700,
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ margin: "0 0 12px 0" }}>Crypto Trading Journal</h2>

      {/* Filter */}
      <div style={{ ...boxStyle, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700 }}>Filter setup:</div>
          <select
            style={{ ...inputStyle, maxWidth: 320 }}
            value={filterSetup}
            onChange={(e) => setFilterSetup(e.target.value)}
          >
            <option value="All">All</option>
            {SETUPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div style={{ marginLeft: "auto", fontSize: 13 }}>
            <b>Total PnL:</b> {totalPnL} &nbsp; | &nbsp; <b>Win Rate:</b> {winRate}%
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ ...boxStyle, marginBottom: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <input
            style={inputStyle}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            style={inputStyle}
            placeholder="Pair (e.g. BTCUSDT)"
            value={form.pair}
            onChange={(e) => setForm({ ...form, pair: e.target.value })}
          />

          <select
            style={inputStyle}
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
          >
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>

          <select
            style={inputStyle}
            value={form.setup}
            onChange={(e) => setForm({ ...form, setup: e.target.value })}
          >
            {SETUPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            style={inputStyle}
            placeholder="Entry"
            type="number"
            value={form.entry}
            onChange={(e) => setForm({ ...form, entry: e.target.value })}
          />

          <input
            style={inputStyle}
            placeholder="Exit"
            type="number"
            value={form.exit}
            onChange={(e) => setForm({ ...form, exit: e.target.value })}
          />

          <input
            style={inputStyle}
            placeholder="Position size (coins)"
            type="number"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
          />

          <button style={buttonStyle} onClick={addTrade}>
            Add Trade
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={boxStyle}>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Pair</th>
                <th style={thStyle}>Setup</th>
                <th style={thStyle}>Dir</th>
                <th style={thStyle}>Entry</th>
                <th style={thStyle}>Exit</th>
                <th style={thStyle}>Size</th>
                <th style={thStyle}>PnL</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td style={tdStyle} colSpan={9}>
                    No trades yet.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => (
                  <tr key={t.id}>
                    <td style={tdStyle}>{t.date}</td>
                    <td style={tdStyle}>{t.pair}</td>
                    <td style={tdStyle}>{t.setup}</td>
                    <td style={tdStyle}>{t.direction}</td>
                    <td style={tdStyle}>{t.entry}</td>
                    <td style={tdStyle}>{t.exit}</td>
                    <td style={tdStyle}>{t.size}</td>
                    <td style={tdStyle}>
                      <b style={{ color: "#111111" }}>
                        {(Number(t.pnl) || 0).toFixed(2)}
                      </b>
                    </td>
                    <td style={tdStyle}>
                      <button style={dangerBtnStyle} onClick={() => deleteTrade(t.id)}>
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "#444" }}>
          Note: Data is stored locally on your device (Telegram/Browser). No one sees your trades.
        </div>
      </div>
    </div>
  );
}