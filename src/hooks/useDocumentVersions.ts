import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DocumentVersion {
  id: string;
  document_id: string;
  user_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  notes: string | null;
  created_at: string;
}

export function useDocumentVersions(documentId: string | null) {
  return useQuery({
    queryKey: ["document-versions", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from("document_versions" as any)
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DocumentVersion[];
    },
    enabled: !!documentId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ documentId, file, notes }: { documentId: string; file: File; notes?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current max version
      const { data: versions } = await supabase
        .from("document_versions" as any)
        .select("version_number")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion = ((versions as any)?.[0]?.version_number || 0) + 1;
      const filePath = `${user.id}/versions/${documentId}/${nextVersion}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("document_versions" as any)
        .insert({
          document_id: documentId,
          user_id: user.id,
          version_number: nextVersion,
          file_path: filePath,
          file_size: file.size,
          notes: notes || null,
        } as any);
      if (insertError) throw insertError;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["document-versions", vars.documentId] });
      toast.success("New version uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
