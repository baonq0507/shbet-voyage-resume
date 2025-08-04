-- Xóa dữ liệu lỗi và chỉ gán role cho user thực sự tồn tại
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Chỉ gán admin role cho user tồn tại (admin@admin.com)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'admin'
  );