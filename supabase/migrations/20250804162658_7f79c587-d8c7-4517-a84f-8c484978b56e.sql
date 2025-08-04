-- Update admin user password directly
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = now(),
    confirmation_token = '',
    updated_at = now()
WHERE email = 'admin@admin.com';