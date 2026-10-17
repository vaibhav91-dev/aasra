"use client";
import { useState } from "react";
import { Cloud, LogIn, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { accountStrings } from "@/lib/account-i18n";
import type { Language } from "@/lib/i18n";
import type { CloudUser, SyncStatus } from "@/lib/use-cloud-account";
import { Modal } from "./modal";
export function Account({
  language,
  user,
  configured,
  status,
  dirty,
  onRefresh,
  onSignedOut,
  onSave,
  onImport,
  deviceCount,
}: {
  language: Language;
  user: CloudUser | null;
  configured: boolean | null;
  status: SyncStatus;
  dirty: boolean;
  onRefresh: () => Promise<void>;
  onSignedOut: () => void;
  onSave: () => Promise<boolean>;
  onImport: () => Promise<boolean>;
  deviceCount: number;
}) {
  const a = accountStrings[language];
  const [open, setOpen] = useState(false),
    [signup, setSignup] = useState(false),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [importing, setImporting] = useState(false),
    [confirmReload, setConfirmReload] = useState(false);
  return (
    <>
      <div className="account-strip">
        <span>
          <Cloud size={17} />
          {user ? `${user.name} · ${a.cloud}` : a.guest}
        </span>
        <button className="button ghost" onClick={() => setOpen(true)}>
          <UserRound size={17} />
          {a.account}
        </button>
      </div>
      {user && (
        <p
          role="status"
          className={
            "notice " +
            (["cloudError", "cloudConflict", "cloudUnavailable"].includes(
              status,
            )
              ? "error"
              : "")
          }
        >
          {a[status === "cloudSaved" && dirty ? "cloudPending" : status]}
          {(status === "cloudError" || status === "cloudConflict") && (
            <button
              className="button secondary"
              onClick={() =>
                status === "cloudConflict"
                  ? setConfirmReload(true)
                  : void onSave()
              }
            >
              {status === "cloudConflict" ? a.reload : a.retry}
            </button>
          )}
        </p>
      )}
      {open && (
        <Modal
          title={a.account}
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <p className="notice">{user ? a.privacy : a.guestPrivacy}</p>
          {configured === false && (
            <p className="notice error">{a.cloudConfig}</p>
          )}
          {configured === null && (
            <p className="notice">{a.cloudUnavailable}</p>
          )}
          {user ? (
            <div className="stack">
              <p>{user.name}</p>
              <p className="muted">{a.switchHint}</p>
              <button
                className="button secondary"
                disabled={busy || status === "cloudSaving"}
                onClick={() => setImporting(true)}
              >
                {a.import} ({deviceCount})
              </button>
              <button
                className="button"
                disabled={busy || status === "cloudSaving"}
                onClick={async () => {
                  if (dirty && !(await onSave())) return;
                  setBusy(true);
                  try {
                    const result = await authClient.signOut();
                    if (result.error) throw new Error();
                    onSignedOut();
                    setOpen(false);
                  } catch {
                    setError(true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {a.signOut}
              </button>
            </div>
          ) : (
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError(false);
                try {
                  const result = signup
                    ? await authClient.signUp.email({
                        email,
                        username,
                        password,
                        name: username,
                      })
                    : await authClient.signIn.username({ username, password });
                  if (result.error) throw new Error();
                  setPassword("");
                  await onRefresh();
                  setOpen(false);
                } catch {
                  setError(true);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <p className="muted">{a.loginHint}</p>
              <label className="field">
                {a.username}
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9_.]{3,30}"
                  disabled={busy}
                  required
                />
                <span className="muted">{a.usernameHint}</span>
              </label>
              {signup && (
                <label className="field">
                  {a.email}
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={busy}
                    maxLength={254}
                  />
                </label>
              )}
              <label className="field">
                {a.password}
                <input
                  type="password"
                  autoComplete={signup ? "new-password" : "current-password"}
                  minLength={12}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={busy}
                />
                <span className="muted">{a.passwordHint}</span>
              </label>
              <div className="button-row">
                <button
                  className="button"
                  disabled={busy || configured !== true}
                >
                  <LogIn size={17} />
                  {signup ? a.signUp : a.signIn}
                </button>
                <button
                  type="button"
                  className="button ghost"
                  disabled={busy}
                  onClick={() => {
                    setSignup(!signup);
                    setError(false);
                  }}
                >
                  {signup ? a.signIn : a.signUp}
                </button>
              </div>
            </form>
          )}
          {error && (
            <p role="alert" className="notice error">
              {a.authError}
            </p>
          )}
          <button
            className="button ghost"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            {a.close}
          </button>
        </Modal>
      )}
      {importing && (
        <Modal title={a.import} onClose={() => setImporting(false)}>
          <p>{a.importHint}</p>
          <p>
            {deviceCount} {a.savedEntries}
          </p>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => setImporting(false)}
            >
              {a.cancel}
            </button>
            <button
              className="button"
              disabled={busy || !deviceCount}
              onClick={async () => {
                setBusy(true);
                if (await onImport()) setImporting(false);
                setBusy(false);
              }}
            >
              {a.importConfirm}
            </button>
          </div>
        </Modal>
      )}
      {confirmReload && (
        <Modal title={a.reloadConfirm} onClose={() => setConfirmReload(false)}>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => setConfirmReload(false)}
            >
              {a.cancel}
            </button>
            <button
              className="button"
              onClick={() => {
                setConfirmReload(false);
                void onRefresh();
              }}
            >
              {a.reload}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
