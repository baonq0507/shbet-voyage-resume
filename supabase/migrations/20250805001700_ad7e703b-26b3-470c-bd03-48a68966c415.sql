-- Disable email confirmation requirement
UPDATE auth.config 
SET enable_signup = true, enable_confirmations = false
WHERE parameter = 'enable_confirmations';

-- If the above doesn't work, we can also update the site settings
INSERT INTO auth.config (parameter, value) 
VALUES ('enable_confirmations', 'false')
ON CONFLICT (parameter) 
DO UPDATE SET value = 'false';