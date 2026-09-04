import { useState, useEffect, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";

interface VaultDoc {
  id: string;
  title: string;
  path: string;
  contentType: string;
  createdAt: string | null;
}

export default function Library() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setPending(false);
    try {
      // Mint the __session cookie so direct /vault/** links open for this user.
      const idToken = await auth.currentUser?.getIdToken();
      const resp = await fetch("/__session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "same-origin",
      });
      if (resp.status === 403) {
        setPending(true);
        setDocs([]);
        return;
      }
      if (!resp.ok) throw new Error("Could not start a secure session.");

      const fn = httpsCallable(functions, "listVaultDocs");
      const res = await fn();
      setDocs((res.data as { docs: VaultDoc[] }).docs || []);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "functions/permission-denied") {
        setPending(true);
      } else {
        setError(e.message || "Failed to load your travel documents.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) load();
    else setLoading(false);
  }, [authLoading, user, load]);

  return (
    <div className="container" style={{ maxWidth: 760, padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--heading)", color: "var(--brown)", marginBottom: 8 }}>
        Travel Vault
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
        Your private travel documents. Only signed-in, approved accounts can open them.
      </p>

      {authLoading || loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
      ) : !user ? (
        <button className="btn btn-teal" onClick={signInWithGoogle}>
          Sign in to view
        </button>
      ) : pending ? (
        <p style={{ color: "var(--text-secondary)" }}>
          Your account is pending approval. You’ll see the vault once it’s approved.
        </p>
      ) : error ? (
        <p style={{ color: "#b91c1c" }}>{error}</p>
      ) : docs.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No documents yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {docs.map((d) => (
            <li
              key={d.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 18px",
                background: "var(--cream)",
              }}
            >
              <a
                href={`/vault/${d.path}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--teal)", fontWeight: 600, fontSize: 16, textDecoration: "none" }}
              >
                {d.title}
              </a>
              {d.createdAt && (
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
                  Added {new Date(d.createdAt).toLocaleDateString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
