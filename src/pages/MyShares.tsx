import React from "react";
import { Link } from "react-router-dom";
import { safeGetShares, revokeShare } from "@/utils/shareUtils";
import { AcceptedShare } from "@/types/shares";

export default function MyShares() {
  const [tick, setTick] = React.useState(0);
  const shares = safeGetShares();
  const accepted: AcceptedShare[] = [];

  for (const [cardId, data] of Object.entries(shares)) {
    const acc = Array.isArray(data.accepted) ? data.accepted : [];
    acc.forEach((token: string) => {
      const mode = data.viewer === token ? "viewer" : data.editor === token ? "editor" : null;
      if (mode) {
        accepted.push({ cardId, mode: mode as 'viewer' | 'editor', token });
      }
    });
  }

  const handleRevoke = (cardId: string, token: string) => {
    revokeShare(cardId, token);
    setTick((n) => n + 1);
  };

  if (!accepted.length) return <p className="p-6">No shares accepted yet.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">My Shared Objectives</h2>
      <ul className="space-y-2">
        {accepted.map((s, i) => (
          <li key={i} className="flex items-center gap-3">
            <Link className="underline text-blue-600" to={`/share/${s.token}/${s.mode}`}>
              Objective #{s.cardId} ({s.mode})
            </Link>
            <button
              onClick={() => handleRevoke(s.cardId, s.token)}
              className="text-red-600 underline text-sm"
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}