import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Bookmark {
  id: string;
  user_id: string;
  document_id: string;
  clause_id: string | null;
  note: string | null;
  color: string;
  created_at: string;
}

export function useBookmarks(documentId: string | null) {
  return useQuery({
    queryKey: ["bookmarks", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from("bookmarks" as any)
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Bookmark[];
    },
    enabled: !!documentId,
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ documentId, clauseId, note, color }: { documentId: string; clauseId?: string; note?: string; color?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("bookmarks" as any).insert({
        user_id: user.id, document_id: documentId, clause_id: clauseId || null, note: note || null, color: color || "yellow",
      } as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["bookmarks", v.documentId] }); toast.success("Bookmark added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, documentId }: { id: string; documentId: string }) => {
      const { error } = await supabase.from("bookmarks" as any).delete().eq("id", id);
      if (error) throw error;
      return documentId;
    },
    onSuccess: (docId) => { qc.invalidateQueries({ queryKey: ["bookmarks", docId] }); toast.success("Bookmark removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
