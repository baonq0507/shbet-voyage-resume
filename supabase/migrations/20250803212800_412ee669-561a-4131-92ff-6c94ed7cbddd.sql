-- Enable real-time for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add the profiles table to the realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;