import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CopyLinkButtonProps {
  objectiveId: string;
  role: "viewer" | "editor";
}

export function CopyLinkButton({ objectiveId, role }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('objective-link', {
        body: { objectiveId, role },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;
      
      const { url } = data;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={loading}
      className="px-3 py-1 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
    >
      {loading ? "..." : copied ? "Copied!" : `Copy ${role} link`}
    </button>
  );
}