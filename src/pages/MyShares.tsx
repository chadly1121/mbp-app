import React from "react";
import { Link } from "react-router-dom";

const getShares2 = () => JSON.parse(localStorage.getItem("shares") || "{}");

export default function MyShares() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const shares = getShares2();
  const accepted: { cardId: string; mode: "viewer"|"editor"; token: string }[] = [];

  for (const [cardId, data] of Object.entries<any>(shares)) {
    (data.accepted || []).forEach((token: string) => {
      const mode = data.viewer === token ? "viewer" : data.editor === token ? "editor" : null;
      if (mode) accepted.push({ cardId, mode, token });
    });
  }

  const revoke = (cardId: string, token: string) => {
    const s = getShares2();
    if (!s[cardId]) return;
    if (s[cardId].viewer === token) s[cardId].viewer = null;
    if (s[cardId].editor === token) s[cardId].editor = null;
    s[cardId].accepted = (s[cardId].accepted || []).filter((t: string) => t !== token);
    localStorage.setItem("shares", JSON.stringify(s));
    force();
  };

  if (!accepted.length) return <p className="p-6">No shares accepted yet.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">My Shared Objectives</h2>
      <ul className="space-y-2">
        {accepted.map((s, i) => (
          <li key={i} className="flex items-center gap-3">
            <Link className="underline text-blue-600" to={`/shared/${s.token}/${s.mode}`}>
              Objective #{s.cardId} ({s.mode})
            </Link>
            <button
              onClick={() => revoke(s.cardId, s.token)}
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