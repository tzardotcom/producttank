import { createClient } from "@/lib/supabase/server";

export type PlanFeatures = {
  checkin?: boolean;
  feedback?: boolean;
  waitlist?: boolean;
  retention?: boolean;
};

export async function getOrgPlanFeatures(organizationId: string): Promise<PlanFeatures> {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("plan_id")
    .eq("id", organizationId)
    .single();
  if (!org?.plan_id) return {};
  const { data: plan } = await supabase
    .from("plans")
    .select("features")
    .eq("id", org.plan_id)
    .single();
  return (plan?.features as PlanFeatures) ?? {};
}
