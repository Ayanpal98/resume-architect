import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Order = {
  id: string; order_number: string; plan_name: string; amount: number; full_name: string;
  email: string; utr_number: string | null; payment_status: string; created_at: string;
};

const AdminOrders = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"pending_verification" | "all">("pending_verification");

  const load = async () => {
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("payment_status", filter);
    const { data } = await q;
    setOrders((data ?? []) as Order[]);
  };

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, filter]);

  const setStatus = async (id: string, status: "paid" | "rejected") => {
    const { error } = await supabase.from("orders")
      .update({ payment_status: status, paid_at: status === "paid" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return toast.error("Could not update order");
    toast.success(status === "paid" ? "Marked as paid — features unlocked" : "Order rejected");
    load();
  };

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Admins only.</div>;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-foreground">Order approvals</h1>
            <p className="text-sm text-muted-foreground">Match each payment reference with your bank statement, then approve.</p>
          </div>
          <Link to="/" className="text-sm text-primary">Back</Link>
        </div>
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant={filter === "pending_verification" ? "default" : "outline"} onClick={() => setFilter("pending_verification")}>Awaiting</Button>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">No orders here.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 text-sm">
                  <div className="font-medium text-foreground">{o.order_number} · {o.plan_name} · ₹{o.amount.toLocaleString("en-IN")}</div>
                  <div className="text-muted-foreground">{o.full_name} · {o.email}</div>
                  <div className="text-muted-foreground">Reference: <span className="font-mono text-foreground">{o.utr_number || "—"}</span> · {new Date(o.created_at).toLocaleString("en-IN")}</div>
                </div>
                {o.payment_status === "pending_verification" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setStatus(o.id, "paid")}>Mark paid</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(o.id, "rejected")}>Reject</Button>
                  </div>
                ) : (
                  <span className="text-xs rounded-full border border-border/60 px-3 py-1 text-muted-foreground capitalize">{o.payment_status.replace("_", " ")}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
