import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const safeGetShares = () => {
  try {
    const raw = localStorage.getItem("shares");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("shares parse error", e);
    return {};
  }
};
const safeSaveShares = (obj: any) => {
  try {
    localStorage.setItem("shares", JSON.stringify(obj));
  } catch (e) {
    console.error("shares save error", e);
  }
};

export default function SharePage() {
  const { token, mode } = useParams();
  const navigate = useNavigate();

  // Debug log
  console.log("[SharePage] params:", { token, mode });

  const { cardIdFound } = useMemo(() => {
    const shares = safeGetShares();
    let found: string | null = null;
    for (const [cardId, data] of Object.entries<any>(shares)) {
      const isViewer = data?.viewer === token && mode === "viewer";
      const isEditor = data?.editor === token && mode === "editor";
      if (isViewer || isEditor) {
        found = cardId;
        // mark accepted
        const arr: string[] = Array.isArray(data.accepted) ? data.accepted : [];
        if (!arr.includes(token!)) {
          data.accepted = [...arr, token];
          safeSaveShares(shares);
        }
        break;
      }
    }
    return { cardIdFound: found };
  }, [token, mode]);

  if (!token || (mode !== "viewer" && mode !== "editor")) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Bad link</h2>
        <button className="underline text-blue-600" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  if (!cardIdFound) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Invalid or revoked link</h2>
        <button className="underline text-blue-600" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === "editor" ? "Editing" : "Viewing"} Objective #{cardIdFound}
      </h2>
      {mode === "editor" ? (
        <textarea className="w-full h-32 border rounded p-2" placeholder="Edit content..." />
      ) : (
        <p className="text-gray-700">Read-only mode</p>
      )}
      <Link className="underline text-blue-600" to="/my-shares">
        Go to My Shares
      </Link>
    </div>
  );
}