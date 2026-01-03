import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { apiJson } from "../lib/api";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import TransactionDetails from "./TransactionDetails";
import Status from "./Status";
import { Link } from "react-router-dom";

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

  function currencySymbol(currency: string) {
    switch (currency) {
      case "usd":
        return "$";
      case "euro":
        return "€";
      case "cdf":
        return "FC";
      default:
        return "";
    }
  }

  return (
    <div className="card">
      <Link className="btn-menu" to="/home">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0077ff"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
      </Link>
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
          <div
            className="row"
            style={{ justifyContent: "space-between", position: "relative" }}
          >
            {/* <span className={"badge"}>{t.status || "unknown"}</span> */}
            {t.status === "DEPOSITED" && (
              <NewReleasesIcon
                style={{
                  position: "absolute",
                  top: 40,
                  right: -10,
                  color: "#EFBF04",
                }}
              />
            )}
            <Status statusValue={t.status || "N/A"} />
            <span className="date">
              {t.created?.substring(0, t.created.length - 9) || ""}
            </span>
          </div>
          <div style={{ marginTop: 8, color: "#1b2224" }}>
            Montant:{" "}
            <span style={{ color: "#0077ff" }}>
              <NumericFormat
                value={parseInt(t.amount?.toString() || "0")}
                displayType={"text"}
                thousandSeparator={" "}
                decimalScale={2}
                decimalSeparator={","}
                fixedDecimalScale={true}
                suffix={currencySymbol(t.currency || "")}
              />
            </span>
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
