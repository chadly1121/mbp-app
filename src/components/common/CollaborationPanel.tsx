import React, { useState, useEffect } from "react";

interface Collaborator {
  email: string;
  role: "viewer" | "editor";
  accepted: boolean;
}

interface CollaborationPanelProps {
  cardId: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ cardId }) => {
  const [links, setLinks] = useState<{ viewer?: string; editor?: string }>({});
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Generate stable permanent link
  const generateLink = (id: string, role: "viewer" | "editor"): string => {
    return `${window.location.origin}/share/${id}?role=${role}`;
  };

  // Copy + generate if needed
  const handleCopy = async (role: "viewer" | "editor") => {
    let link = links[role];
    if (!link) {
      link = generateLink(cardId, role);
      setLinks((prev) => ({ ...prev, [role]: link }));
    }
    try {
      await navigator.clipboard.writeText(link);
      alert(`${role} link copied!`);
    } catch (err) {
      console.error("Clipboard failed:", err);
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert(`${role} link copied (fallback)!`);
    }
  };

  // Add collaborator by email + role
  const handleAdd = (email: string, role: "viewer" | "editor") => {
    if (!email) return;
    setCollaborators((prev) => {
      if (prev.find((c) => c.email === email && c.role === role)) return prev;
      return [...prev, { email, role, accepted: false }];
    });
  };

  // Revoke collaborator
  const handleRevoke = (email: string) => {
    setCollaborators((prev) => prev.filter((c) => c.email !== email));
    localStorage.removeItem(`${cardId}-${email}`);
  };

  // Simulate auto-accept when visiting link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareRole = params.get("role") as "viewer" | "editor" | null;
    if (window.location.pathname.startsWith("/share/") && shareRole) {
      const id = window.location.pathname.split("/share/")[1];
      if (id === cardId) {
        const email = localStorage.getItem("currentUserEmail") || "unknown@example.com";
        // Mark accepted for this user
        setCollaborators((prev) => {
          const exists = prev.find((c) => c.email === email && c.role === shareRole);
          if (exists) {
            return prev.map((c) =>
              c.email === email && c.role === shareRole ? { ...c, accepted: true } : c
            );
          } else {
            return [...prev, { email, role: shareRole, accepted: true }];
          }
        });
        localStorage.setItem(`${cardId}-${email}`, "accepted");
      }
    }
  }, [cardId]);

  return (
    <div className="border rounded p-3 space-y-3 bg-gray-50">
      {/* Copy Link Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCopy("viewer")}
          className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Copy Viewer Link
        </button>
        <button
          onClick={() => handleCopy("editor")}
          className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
        >
          Copy Editor Link
        </button>
      </div>

      {/* Invite Form */}
      <div className="flex gap-2">
        <input
          id={`email-${cardId}`}
          type="email"
          placeholder="Invite by email"
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={() => {
            const input = document.getElementById(`email-${cardId}`) as HTMLInputElement;
            if (input.value) {
              handleAdd(input.value, "viewer");
              input.value = "";
            }
          }}
          className="px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600"
        >
          Add Viewer
        </button>
        <button
          onClick={() => {
            const input = document.getElementById(`email-${cardId}`) as HTMLInputElement;
            if (input.value) {
              handleAdd(input.value, "editor");
              input.value = "";
            }
          }}
          className="px-2 py-1 rounded bg-purple-500 text-white hover:bg-purple-600"
        >
          Add Editor
        </button>
      </div>

      {/* Collaborator List */}
      <div>
        <h4 className="font-semibold mb-2">Collaborators</h4>
        {collaborators.length === 0 && (
          <p className="text-sm text-gray-500">No collaborators yet</p>
        )}
        <ul className="space-y-1">
          {collaborators.map((c) => (
            <li
              key={`${c.email}-${c.role}`}
              className="flex justify-between items-center bg-white border rounded px-2 py-1"
            >
              <span>
                {c.email} — {c.role}{" "}
                {c.accepted ? (
                  <span className="text-green-600">(Accepted)</span>
                ) : (
                  <span className="text-gray-500">(Invited)</span>
                )}
              </span>
              <button
                onClick={() => handleRevoke(c.email)}
                className="text-red-500 text-sm underline"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};