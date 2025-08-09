import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash, Plus, Check, X } from "lucide-react";

interface BankEntry {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_code_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function AdminBanks() {
  const { toast } = useToast();
  const [banks, setBanks] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [openCreate, setOpenCreate] = useState(false);
  const [newBank, setNewBank] = useState({
    bank_name: "",
    account_number: "",
    account_holder: "",
    is_active: true,
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BankEntry>>({});

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("bank")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBanks((data || []) as BankEntry[]);
    } catch (err) {
      console.error("Error fetching banks:", err);
      toast({ title: "Lỗi", description: "Không thể tải danh sách ngân hàng", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const resetCreateForm = () => {
    setNewBank({ bank_name: "", account_number: "", account_holder: "", is_active: true });
  };

  const handleCreate = async () => {
    if (!newBank.bank_name || !newBank.account_number || !newBank.account_holder) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập đầy đủ: Ngân hàng, Số TK, Chủ TK", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("bank").insert([
        {
          bank_name: newBank.bank_name,
          account_number: newBank.account_number,
          account_holder: newBank.account_holder,
          is_active: newBank.is_active,
        },
      ]);
      if (error) throw error;
      toast({ title: "Thành công", description: "Đã thêm ngân hàng" });
      setOpenCreate(false);
      resetCreateForm();
      fetchBanks();
    } catch (err) {
      console.error("Error creating bank:", err);
      toast({ title: "Lỗi", description: "Không thể thêm ngân hàng", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (bank: BankEntry) => {
    setEditingId(bank.id);
    setEditData({ ...bank });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      const payload = {
        bank_name: editData.bank_name,
        account_number: editData.account_number,
        account_holder: editData.account_holder,
        is_active: !!editData.is_active,
      };
      const { error } = await supabase.from("bank").update(payload).eq("id", editingId);
      if (error) throw error;
      toast({ title: "Đã lưu", description: "Cập nhật ngân hàng thành công" });
      setEditingId(null);
      setEditData({});
      fetchBanks();
    } catch (err) {
      console.error("Error updating bank:", err);
      toast({ title: "Lỗi", description: "Không thể cập nhật ngân hàng", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (bank: BankEntry, value: boolean) => {
    try {
      const { error } = await supabase.from("bank").update({ is_active: value }).eq("id", bank.id);
      if (error) throw error;
      setBanks((prev) => prev.map((b) => (b.id === bank.id ? { ...b, is_active: value } : b)));
    } catch (err) {
      console.error("Error toggling bank:", err);
      toast({ title: "Lỗi", description: "Không thể đổi trạng thái", variant: "destructive" });
    }
  };

  const removeBank = async (bank: BankEntry) => {
    if (!confirm(`Xóa ngân hàng ${bank.bank_name}?`)) return;
    try {
      const { error } = await supabase.from("bank").delete().eq("id", bank.id);
      if (error) throw error;
      toast({ title: "Đã xóa", description: "Ngân hàng đã được xóa" });
      setBanks((prev) => prev.filter((b) => b.id !== bank.id));
    } catch (err) {
      console.error("Error deleting bank:", err);
      toast({ title: "Lỗi", description: "Không thể xóa ngân hàng", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý ngân hàng</h2>
        <Button onClick={() => setOpenCreate(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm ngân hàng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ngân hàng</CardTitle>
          <CardDescription>Thiết lập thông tin ngân hàng để người dùng nạp tiền</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngân hàng</TableHead>
                <TableHead>Số tài khoản</TableHead>
                <TableHead>Chủ tài khoản</TableHead>
                <TableHead>Đang bật</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {editingId === b.id ? (
                      <Input value={editData.bank_name as string} onChange={(e) => setEditData((d) => ({ ...d, bank_name: e.target.value }))} />
                    ) : (
                      <span className="font-medium">{b.bank_name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <Input value={editData.account_number as string} onChange={(e) => setEditData((d) => ({ ...d, account_number: e.target.value }))} />
                    ) : (
                      b.account_number
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <Input value={editData.account_holder as string} onChange={(e) => setEditData((d) => ({ ...d, account_holder: e.target.value }))} />
                    ) : (
                      b.account_holder
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-2">
                        <Switch checked={!!editData.is_active} onCheckedChange={(v) => setEditData((d) => ({ ...d, is_active: v }))} />
                        <span>{editData.is_active ? "Bật" : "Tắt"}</span>
                      </div>
                    ) : (
                      <Switch checked={b.is_active} onCheckedChange={(v) => toggleActive(b, v)} />
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} disabled={loading}>
                          <Check className="w-4 h-4 mr-1" /> Lưu
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="w-4 h-4 mr-1" /> Hủy
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(b)}>
                          <Edit className="w-4 h-4 mr-1" /> Sửa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeBank(b)}>
                          <Trash className="w-4 h-4 mr-1" /> Xóa
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {banks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Chưa có ngân hàng nào. Hãy thêm mới.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Thêm ngân hàng mới</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Tên ngân hàng</Label>
              <Input value={newBank.bank_name} onChange={(e) => setNewBank((s) => ({ ...s, bank_name: e.target.value }))} placeholder="Vietcombank, Techcombank..." />
            </div>
            <div>
              <Label>Số tài khoản</Label>
              <Input value={newBank.account_number} onChange={(e) => setNewBank((s) => ({ ...s, account_number: e.target.value }))} placeholder="1234567890" />
            </div>
            <div>
              <Label>Chủ tài khoản</Label>
              <Input value={newBank.account_holder} onChange={(e) => setNewBank((s) => ({ ...s, account_holder: e.target.value }))} placeholder="Nguyễn Văn A" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newBank.is_active} onCheckedChange={(v) => setNewBank((s) => ({ ...s, is_active: v }))} />
              <Label>{newBank.is_active ? "Bật" : "Tắt"}</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "Đang lưu..." : "Thêm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminBanks;
