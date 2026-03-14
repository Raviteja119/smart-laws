import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GovernmentBill {
  id: string;
  title: string;
  description: string | null;
  sector: string;
  state: string;
  financial_year: string;
  introduced_date: string | null;
  status: string;
  bill_type: string;
  ministry: string | null;
  source_url: string | null;
  created_at: string;
}

export function useGovernmentBills() {
  return useQuery({
    queryKey: ["government-bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("government_bills")
        .select("*")
        .order("introduced_date", { ascending: false });
      if (error) throw error;
      return (data || []) as GovernmentBill[];
    },
  });
}
