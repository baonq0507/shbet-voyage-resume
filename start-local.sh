#!/bin/bash

echo "🚀 Starting Supabase Local Development Environment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Start Supabase local development
echo "📦 Starting Supabase local services..."
supabase start

# Wait a moment for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Set environment variable to use local Supabase
export VITE_USE_LOCAL_SUPABASE=true

echo "🌐 Starting React development server..."
echo "📊 Supabase Studio: http://206.206.126.141:54323"
echo "🔗 API URL: http://206.206.126.141:54321"
echo "🗄️  Database: postgresql://postgres:postgres@206.206.126.141:54322/postgres"

# Start the React development server
npm run dev 