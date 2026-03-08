import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export function useTags() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tags", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("document_tags" as any).select("*").order("name");
      if (error) throw error;
      return (data || []) as unknown as Tag[];
    },
    enabled: !!user,
  });
}

export function useDocumentTags(documentId: string | null) {
  return useQuery({
    queryKey: ["document-tags", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from("document_tag_links" as any)
        .select("*, document_tags(*)")
        .eq("document_id", documentId);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!documentId,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("document_tags" as any).insert({ user_id: user.id, name, color: color || "blue" } as any).select().single();
      if (error) throw error;
      return data as unknown as Tag;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tags"] }); toast.success("Tag created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleDocumentTag() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ documentId, tagId, linked }: { documentId: string; tagId: string; linked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (linked) {
        await supabase.from("document_tag_links" as any).delete().eq("document_id", documentId).eq("tag_id", tagId);
      } else {
        const { error } = await supabase.from("document_tag_links" as any).insert({ document_id: documentId, tag_id: tagId, user_id: user.id } as any);
        if (error) throw error;
      }
      return documentId;
    },
    onSuccess: (docId) => { qc.invalidateQueries({ queryKey: ["document-tags", docId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}
