import { useState, useEffect, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { useAuth } from "../hooks/useAuth";

interface AdminUser {
  uid: string;
  email: string;
  name: string;
  approved: boolean;
  tier: string;
  createdAt: string | null;
}

export default function Admin() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const fn = httpsCallable(functions, "listUsers");
      const res = await fn();
      setUsers((res.data as { users: AdminUser[] }).users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) load();
    else setLoading(false);
  }, [authLoading, user, load]);

  const setApproval = async (uid: string, approved: boolean) => {
    setBusy(uid);
    setError("");
    try {
      const fn = httpsCallable(functions, "setUserApproval");
      await fn({ uid, approved });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, approved } : u)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: "40px 24px" }}>Loading…</div>;
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--heading)" }}>Admin</h1>
        <p style={{ color: "var(--text-secondary)" }}>Sign in to continue.</p>
        <button className="btn btn-primary" onClick={signInWithGoogle}>Sign in</button>
      </div>
    );
  }

  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);

  const row = (u: AdminUser, action: "approve" | "revoke") => (
    <div
      key={u.uid}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        marginBottom: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: "var(--brown)" }}>{u.name || "(no name)"}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {u.email}
          {u.createdAt ? ` · joined ${new Date(u.createdAt).toLocaleDateString()}` : ""}
        </div>
      </div>
      <button
        className={action === "approve" ? "btn btn-primary" : "btn btn-secondary"}
        disabled={busy === u.uid}
        onClick={() => setApproval(u.uid, action === "approve")}
        style={{ fontSize: 13, padding: "8px 14px" }}
      >
        {busy === u.uid ? "…" : action === "approve" ? "Approve" : "Revoke"}
      </button>
    </div>
  );

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--heading)", fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
        User approvals
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
        Approve who can generate itineraries. New sign-ups are pending until you approve them.
      </p>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius)",
            color: "var(--error)",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "8px 0 12px" }}>
        Pending ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>No one waiting.</p>
      ) : (
        pending.map((u) => row(u, "approve"))
      )}

      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "24px 0 12px" }}>
        Approved ({approved.length})
      </h2>
      {approved.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>None yet.</p>
      ) : (
        approved.map((u) => row(u, "revoke"))
      )}
    </div>
  );
}
