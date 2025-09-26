import React, { useState, useEffect } from "react";

// Simple ID generator
const genId = () => Math.random().toString(36).substring(2, 10);

// Helpers for localStorage
const loadState = (key: string, fallback: any) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const saveState = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Types
type Role = "viewer" | "editor";
interface Collaborator {
  id: string;
  email: string;
  role: Role;
  accepted: boolean;
}
interface ShareLinks {
  viewer?: string;
  editor?: string;
}

interface CollaborationPanelProps {
  cardId: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ cardId }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [links, setLinks] = useState<ShareLinks>({});
  const [email, setEmail] = useState("");

  const collabKey = `collabs:${cardId}`;
  const linksKey = `links:${cardId}`;

  // Load from localStorage on mount
  useEffect(() => {
    setCollaborators(loadState(collabKey, []));
    setLinks(loadState(linksKey, {}));
  }, [cardId]);

  // Persist when things change
  useEffect(() => {
    saveState(collabKey, collaborators);
  }, [collaborators]);
  useEffect(() => {
    saveState(linksKey, links);
  }, [links]);

  // Generate or return permanent hidden link
  const getLink = (role: Role) => {
    if (!links[role]) {
      const newLink = `${window.location.origin}/share/${cardId}/${role}/${genId()}`;
      const updated = { ...links, [role]: newLink };
      setLinks(updated);
      return newLink;
    }
    return links[role]!;
  };

  // Copy to clipboard
  const copyLink = (role: Role) => {
    const link = getLink(role);
    navigator.clipboard.writeText(link);
    alert(`${role} link copied!`);
  };

  // Add collaborator manually
  const addCollaborator = (role: Role) => {
    if (!email) return;
    const newCollab: Collaborator = {
      id: genId(),
      email,
      role,
      accepted: false,
    };
    setCollaborators([...collaborators, newCollab]);
    setEmail("");
  };

  // Mark accepted if they visit
  useEffect(() => {
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split("/");
    if (pathParts[1] === "share" && pathParts[2] === cardId) {
      const role = pathParts[3] as Role;
      setCollaborators((prev) =>
        prev.map((c) =>
          c.role === role ? { ...c, accepted: true } : c
        )
      );
    }
  }, [cardId]);

  // Revoke collaborator
  const revoke = (collabId: string) => {
    setCollaborators(collaborators.filter((c) => c.id !== collabId));
  };

  return (
    <div className="border rounded p-3 space-y-3 bg-gray-50">
      <h4 className="font-semibold mb-2">Collaboration</h4>
      
      {/* Copy buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => copyLink("viewer")}
          className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Copy Viewer Link
        </button>
        <button 
          onClick={() => copyLink("editor")}
          className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
        >
          Copy Editor Link
        </button>
      </div>

      {/* Invite form */}
      <div className="flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Invite by email"
          className="border px-2 py-1 rounded flex-1"
        />
        <button 
          onClick={() => addCollaborator("viewer")}
          className="px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600"
        >
          Add Viewer
        </button>
        <button 
          onClick={() => addCollaborator("editor")}
          className="px-2 py-1 rounded bg-purple-500 text-white hover:bg-purple-600"
        >
          Add Editor
        </button>
      </div>

      {/* List of collaborators */}
      <div>
        <h5 className="font-medium mb-2">Collaborators</h5>
        {collaborators.length === 0 && (
          <p className="text-sm text-gray-500">No collaborators yet</p>
        )}
        <ul className="space-y-1">
          {collaborators.map((c) => (
            <li key={c.id} className="flex justify-between items-center bg-white border rounded px-2 py-1">
              <span>
                {c.email || "(link invite)"} — {c.role} —{" "}
                {c.accepted ? (
                  <span className="text-green-600">✅ Accepted</span>
                ) : (
                  <span className="text-gray-500">⏳ Invited</span>
                )}
              </span>
              <button 
                onClick={() => revoke(c.id)}
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