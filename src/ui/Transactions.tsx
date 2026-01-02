import React, { useEffect, useState } from "react";
import { apiJson } from "../lib/api";
import TransactionDetails from "./TransactionDetails";
import Status from "./Status";

type Tx = {
  id: string;
  reference?: string;
  amount: number;
  currency?: string;
  status?: string;
  created?: string;
  funds_in?: string;
  funds_out?: string;
};

type TxResp = { transactions: Tx[] };

export default function Transactions() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Tx | null>(null);

  useEffect(() => {
    apiJson<TxResp>("/api/transactions")
      .then((r) => setTxs(r.transactions || []))
      .catch((e) => setErr(e.message ?? "Erreur"));
  }, []);

  function handleUpdated(updated: Tx) {
    setTxs((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(updated);
  }

  return (
    <div className="card">
      <h2 className="menu-title">Mes transferts</h2>
      {err && <div style={{ color: "#ff9aa2" }}>{err}</div>}
      {!err && txs.length === 0 && (
        <div className="muted">Aucune transaction.</div>
      )}
      {txs.map((t) => (
        <div
          key={t.id}
          className="card"
          style={{ margin: "10px 0", cursor: "pointer" }}
          onClick={() => setSelected(t)}
        >
          <div className="row" style={{ justifyContent: "space-between" }}>
            {/* <span className={"badge"}>{t.status || "unknown"}</span> */}
            <Status statusValue={t.status || "N/A"}/>
            <span className="muted">{t.created || ""}</span>
          </div>
          <div style={{ marginTop: 8, color: "#676767" }}>
            Montant: <span style={{color: "#1b2224"}}>{t.amount ?? "—"} {t.currency ?? ""}</span>
          </div>
        </div>
      ))}

      {selected && (
        <TransactionDetails
          tx={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
