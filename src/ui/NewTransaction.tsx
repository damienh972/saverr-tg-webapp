import React, { useState, ChangeEvent, FormEvent } from "react";
import { apiJson } from "../lib/api";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type TransactionDirection = "EURO_TO_RDC" | "RDC_TO_EURO";
type ModeOption = { value: string; label: string };
type FundsMode = "BANK_WIRE" | "MOBILE_MONEY" | "STABLE" | "CASH";

interface FormData {
  transactionDirection: TransactionDirection;
  isEscrow: boolean;
  amount: string;
  currency: "euro" | "usd" | "cdf" | "usdc" | "";
  depositMode: FundsMode | "";
  receiveMode: FundsMode | "";
}

interface TransactionSubmitResponse {
  ok: boolean;
  transaction_id?: string;
  message?: string;
  error?: string;
}
const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };
export default function TransactionForm() {
  const [formData, setFormData] = useState<FormData>({
    transactionDirection: "EURO_TO_RDC",
    isEscrow: false,
    amount: "",
    currency: "",
    depositMode: "",
    receiveMode: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get available deposit options based on transaction direction
  // Cash is only available for RDC_TO_EURO transactions on deposit
  const getDepositOptions = (): ModeOption[] => {
    const baseOptions: ModeOption[] = [
      { value: "BANK_WIRE", label: "Virement bancaire (IBAN)" },
      { value: "MOBILE_MONEY", label: "Mobile Money" },
      { value: "STABLE", label: "Stablecoin" },
    ];

    if (formData.transactionDirection === "RDC_TO_EURO") {
      return [{ value: "CASH", label: "Espèces" }, ...baseOptions];
    }
    return baseOptions;
  };

  // Get available receive options based on transaction direction
  // Cash is only available for EURO_TO_RDC transactions on receive
  const getReceiveOptions = (): ModeOption[] => {
    const baseOptions: ModeOption[] = [
      { value: "BANK_WIRE", label: "Virement bancaire (IBAN)" },
      { value: "MOBILE_MONEY", label: "Mobile Money" },
      { value: "STABLE", label: "Stablecoin" },
    ];

    if (formData.transactionDirection === "EURO_TO_RDC") {
      return [{ value: "CASH", label: "Espèces" }, ...baseOptions];
    }
    return baseOptions;
  };

  const handleChange = (
    field: keyof FormData,
    value: string | boolean
  ): void => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset deposit/receive modes if they become invalid after direction change
      if (field === "transactionDirection") {
        const depositOpts = getDepositOptions().map((o) => o.value);
        const receiveOpts = getReceiveOptions().map((o) => o.value);

        if (!depositOpts.includes(prev.depositMode as string)) {
          updated.depositMode = "";
        }
        if (!receiveOpts.includes(prev.receiveMode as string)) {
          updated.receiveMode = "";
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Veuillez saisir un montant valide");
      setLoading(false);
      return;
    }

    if (!formData.currency) {
      setError("Veuillez sélectionner une devise");
      setLoading(false);
      return;
    }

    if (!formData.depositMode || !formData.receiveMode) {
      setError("Veuillez sélectionner les modes de dépôt et réception");
      setLoading(false);
      return;
    }

    try {
      const response = await apiJson<TransactionSubmitResponse>(
        "/api/transaction/submit",
        {
          method: "POST",
          body: {
            type: formData.isEscrow ? "ESCROW" : "TRANSFER",
            direction: formData.transactionDirection,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            funds_in: formData.depositMode,
            funds_out: formData.receiveMode,
          },
        }
      );

      if (response.ok) {
        alert(`Demande envoyée avec succès ! ID: ${response.transaction_id}`);
        // Reset form
        setFormData({
          transactionDirection: "EURO_TO_RDC",
          isEscrow: false,
          amount: "",
          currency: "",
          depositMode: "",
          receiveMode: "",
        });
      } else {
        setError(response.error || "Erreur serveur");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    !formData.amount ||
    !formData.currency ||
    !formData.depositMode ||
    !formData.receiveMode ||
    loading;

  return (
    <div className="card">
      <h2 className="menu-title">Nouveau transfert</h2>
      <div className="muted" style={{ marginBottom: 24 }}>
        Configurez votre transfert en quelques clics
      </div>

      <form onSubmit={handleSubmit}>
        {/* Transaction direction and escrow option */}
        <div className="row" style={{ marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Type de transaction
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={formData.transactionDirection}
                label="Type de transaction"
                required
                onChange={(e) =>
                  handleChange(
                    "transactionDirection",
                    e.target.value as TransactionDirection
                  )
                }
                disabled={loading}
              >
                <MenuItem value="EURO_TO_RDC">Euro → RDC</MenuItem>
                <MenuItem value="RDC_TO_EURO">RDC → Euro</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div style={{ flex: 1 }}>
            <label className="checkbox-wrapper" style={{ marginTop: 4 }}>
              <Checkbox
                {...label}
                checked={formData.isEscrow}
                onChange={(e) => handleChange("isEscrow", e.target.checked)}
                disabled={loading}
                sx={{
                  color: "#0077ff",
                  "&.Mui-checked": {
                    color: "#0077ff",
                  },
                }}
              />
              <span style={{ fontSize: 14, color: "#ff6b6b", marginLeft: 1 }}>
                Anti sanctions
              </span>
            </label>
          </div>
        </div>

        {/* Amount input */}
        <div className="input-fields">
          <div className="form-group">
            <TextField
              id="outlined-basic"
              name="MERGE0"
              label="Montant"
              type="number"
              required
              placeholder="Saisissez votre montant"
              variant="outlined"
              disabled={loading}
              value={formData.amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("amount", e.target.value)
              }
            />
          </div>

          {/* Currency selection */}
          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Devise</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                className="fields"
                value={formData.currency}
                label="Devise"
                required
                onChange={(e) => handleChange("currency", e.target.value)}
                disabled={loading}
              >
                <MenuItem value="euro">Euro (EUR)</MenuItem>
                <MenuItem value="usd">Dollar américain (USD)</MenuItem>
                <MenuItem value="cdf">Franc congolais (CDF)</MenuItem>
                <MenuItem value="usdc">USD Coin (USDC)</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Deposit and receive modes */}

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Mode de dépôt
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                className="fields"
                value={formData.depositMode}
                label="Mode de dépôt"
                required
                onChange={(e) =>
                  handleChange("depositMode", e.target.value as FundsMode)
                }
                disabled={loading}
              >
                {getDepositOptions().map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Mode de réception
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                className="fields"
                value={formData.receiveMode}
                label="Mode de dépôt"
                required
                onChange={(e) =>
                  handleChange("receiveMode", e.target.value as FundsMode)
                }
                disabled={loading}
              >
                {getReceiveOptions().map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: "#ff9aa2", fontSize: 14 }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="btn"
            disabled={isSubmitDisabled}
            style={{
              marginTop: 24,
              fontWeight: 600,
              opacity: isSubmitDisabled ? 0.5 : 1,
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
            }}
            variant="outlined"
            endIcon={<SendIcon />}
          >
            {loading ? "Envoi en cours…" : "Envoyer ma demande"}
          </Button>
        </div>
      </form>
    </div>
  );
}
