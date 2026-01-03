import React, { useState } from "react";
import { NumericFormat } from "react-number-format";
import { TransferButton } from "./TransferButton";
import { updateTransactionStatus } from "../lib/api";
import { apiJson } from "../lib/api";
import { useMe } from "../hooks/useMe";
import {
  getFundsInInstructions,
  getFundsOutInstructions,
  generateCashAddress
} from "../lib/transactionUtils";
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
  iban?: string;
};

type Props = {
  tx: Tx;
  onClose: () => void;
  onUpdated: (tx: Tx) => void; // Callback to update the transaction list
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: "En attente de validation",
  PROCESSING: "En attente de dépôt",
  DEPOSITED: "Dépot effectué",
  TRANSFERRED: "Transfer effectué",
  COMPLETED: "Opération finalisée",
  CANCELLED: "Annulée",
};

function formatStatus(status?: string) {
  if (!status) return "Inconnu";
  return STATUS_LABELS[status] || status;
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

export default function TransactionDetails({ tx, onClose, onUpdated }: Props) {
  const { user } = useMe();
  const [loading, setLoading] = React.useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleStatusChange(
    status: "PROCESSING" | "CANCELLED" | "TRANSFERRED"
  ) {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateTransactionStatus(tx.id, status);
      onUpdated(updated.transaction ?? updated);
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  const simulateDeposit = async (txId: string) => {
    if (isSimulating) return;

    setIsSimulating(true);
    try {
      await apiJson(`/api/transaction/${txId}/simulate_deposit`, {
        method: "POST",
      });
      onUpdated({
        ...tx,
        status: "DEPOSITED",
      });
    } catch (error) {
      console.error("❌ Simulation échouée:", error);
    }
  };

  return (
    <div
      className="card"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <div
          className="row"
          style={{ justifyContent: "space-between", marginBottom: 8 }}
        >
          <h3 className="brand">Détails du transfert</h3>
          <button onClick={onClose}>✖</button>
        </div>

        {error && (
          <div style={{ color: "#ff9aa2", marginBottom: 8 }}>{error}</div>
        )}

        <div className="transfer-details">
          Référence : <b>{tx.reference ?? tx.id}</b>
        </div>
        <div className="transfer-details">
          Montant :{" "}
          <span style={{ color: "#0077ff" }}>
            <NumericFormat
              value={parseInt(tx.amount?.toString() || "0")}
              displayType={"text"}
              thousandSeparator={" "}
              decimalScale={2}
              decimalSeparator={","}
              fixedDecimalScale={true}
              suffix={currencySymbol(tx.currency || "")}
            />
          </span>
        </div>
        <div className="transfer-details">
          <p className="statut-key">Statut : </p><Status statusValue={tx.status || "N/A"} />
        </div>
        <div className="transfer-details">
          Créée le :{" "}
          <span className="muted">{tx.created?.replace(" ", " à ") || ""}</span>
        </div>

        {tx.status === "CREATED" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <p>Votre demande de transaction est en cours de traitement.</p>
          </div>
        )}

        {tx.status === "PROCESSING" && tx.funds_in && (
          <div
            className="card"
            style={{ marginTop: 16, padding: 12, background: "#f8f9fa" }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              📋 Instructions de dépôt
            </div>
            <pre
              style={{
                background: "#fff",
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
              }}
            >
              {getFundsInInstructions(tx.funds_in)}
            </pre>
            <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
              Copiez ces informations et effectuez le dépôt
            </div>
            <TransferButton buttonText={isSimulating ? "dépot effectué" : "Simuler le dépôt"} amount={tx.amount} callback={simulateDeposit} txId={tx.id} />
          </div>
        )}

        {tx.status === "DEPOSITED" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <TransferButton
              buttonText="Valider le transfert"
              amount={tx.amount}
              callback={handleStatusChange}
              isTransfer={true}
            />
          </div>
        )}

        {tx.status === "TRANSFERRED" && (
          tx.funds_out === "CASH" ? (
          <div className="muted" style={{ marginTop: 8 }}>
              Vos fonds sont disponible en especes à l'adresse suivante : 
              <br />
              <p style={{margin: "15px 0", fontWeight: "bold"}}>{generateCashAddress()}</p>
              <br />
              Présentez vous avec vos documents d'identité.
          </div>
          ) : (
            <div className="muted" style={{ marginTop: 8 }}>
              Vos fonds sont transférés et en cours de livraison sur votre compte de reception.
            </div>
          )
        )}

        {tx.status === "COMPLETED" && tx.funds_out && (
          <div
            className="card"
            style={{ marginTop: 16, padding: 12, background: "#f0f9f0" }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              🎉 Instructions de retrait
            </div>
            <pre
              style={{
                background: "#fff",
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
              }}
            >
              {getFundsOutInstructions(tx.funds_out, tx.iban, user?.phone || "")}
            </pre>
          </div>
        )}

        {loading && (
          <div className="muted" style={{ marginTop: 8 }}>
            Traitement en cours…
          </div>
        )}
      </div>
    </div>
  );
}
