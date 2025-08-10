-- =============================================
-- FIX BANK RLS POLICIES
-- Thêm các chính sách cần thiết cho bảng bank
-- =============================================

-- Xóa chính sách cũ nếu tồn tại
DROP POLICY IF EXISTS "Anyone can view active banks" ON public.bank;

-- Tạo chính sách mới cho SELECT - cho phép tất cả người dùng xem ngân hàng đang hoạt động
CREATE POLICY "Anyone can view active banks" 
ON public.bank FOR SELECT 
USING (is_active = true);

-- Chính sách cho INSERT - chỉ admin mới có thể thêm ngân hàng mới
CREATE POLICY "Admins can insert banks" 
ON public.bank FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Chính sách cho UPDATE - chỉ admin mới có thể cập nhật thông tin ngân hàng
CREATE POLICY "Admins can update banks" 
ON public.bank FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Chính sách cho DELETE - chỉ admin mới có thể xóa ngân hàng
CREATE POLICY "Admins can delete banks" 
ON public.bank FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chính sách cho tất cả thao tác - admin có quyền quản lý hoàn toàn
CREATE POLICY "Admins can manage all banks" 
ON public.bank FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
