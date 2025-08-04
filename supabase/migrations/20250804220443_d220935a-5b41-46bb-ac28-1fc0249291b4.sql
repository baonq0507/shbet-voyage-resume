-- Create games table to store game data from API
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL, -- Original game ID from API
    name VARCHAR(500) NOT NULL,
    image TEXT,
    type VARCHAR(100),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    provider VARCHAR(100),
    rank INTEGER DEFAULT 0,
    gpid INTEGER NOT NULL, -- Game Provider ID
    game_provider_id INTEGER,
    game_type INTEGER,
    new_game_type INTEGER,
    rtp DECIMAL(5,2),
    rows INTEGER,
    reels INTEGER,
    lines INTEGER,
    is_maintain BOOLEAN DEFAULT false,
    is_enabled BOOLEAN DEFAULT true,
    is_provider_online BOOLEAN DEFAULT true,
    supported_currencies TEXT[],
    block_countries TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for better performance
    UNIQUE(game_id, gpid) -- Ensure unique combination of game_id and gpid
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_games_gpid_category ON games(gpid, category);
CREATE INDEX IF NOT EXISTS idx_games_provider_type ON games(provider, type);

-- Add RLS (Row Level Security) policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access to games
CREATE POLICY "Allow public read access to games" ON games
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update games (for admin functions)
CREATE POLICY "Allow authenticated users to manage games" ON games
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at_trigger
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_games_updated_at();

-- Insert some sample data for testing
INSERT INTO games (game_id, name, image, type, category, is_active, provider, rank, gpid, game_provider_id, game_type, new_game_type, rtp, rows, reels, lines, is_maintain, is_enabled, is_provider_online, supported_currencies, block_countries) VALUES
('sample_1', 'Sample Baccarat Game', 'https://via.placeholder.com/300x200?text=Baccarat', 'Baccarat', 'Live Casino', true, 'BigGaming', 1, 1, 1, 101, 101, 96.50, 0, 0, 0, false, true, true, ARRAY['USD', 'EUR'], ARRAY['US', 'UK']),
('sample_2', 'Sample Roulette Game', 'https://via.placeholder.com/300x200?text=Roulette', 'Roulette', 'Live Casino', true, 'BigGaming', 2, 5, 5, 103, 103, 97.20, 0, 0, 0, false, true, true, ARRAY['USD', 'EUR'], ARRAY['US', 'UK'])
ON CONFLICT (game_id, gpid) DO NOTHING;