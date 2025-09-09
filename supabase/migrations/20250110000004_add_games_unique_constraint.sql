-- Add unique constraint for game_id and gpid combination in games table
-- This is required for the upsert operation with onConflict to work properly

-- Add unique constraint
ALTER TABLE public.games 
ADD CONSTRAINT games_game_id_gpid_unique UNIQUE (game_id, gpid);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_games_game_id_gpid ON public.games (game_id, gpid);

-- Add comment
COMMENT ON CONSTRAINT games_game_id_gpid_unique ON public.games IS 'Unique constraint for game_id and gpid combination to support upsert operations';
