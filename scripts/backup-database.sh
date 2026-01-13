#!/bin/bash

# ============================================
# OneKit Supabase Database Backup Script
# Run manually or via cron for database backups
# ============================================

# Load environment variables
source .env.local 2>/dev/null || source .env 2>/dev/null

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/onekit_backup_${DATE}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting OneKit Database Backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Install with: npm install -g supabase${NC}"
    exit 1
fi

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo -e "${YELLOW}⚠️  Project not linked. Run: supabase link --project-ref YOUR_PROJECT_REF${NC}"
    echo -e "${YELLOW}   You can find your project ref in Supabase Dashboard > Settings > General${NC}"
    exit 1
fi

# Create backup using Supabase CLI
echo -e "${YELLOW}📦 Creating database dump...${NC}"
supabase db dump -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip $BACKUP_FILE
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    SIZE=$(du -h $COMPRESSED_FILE | cut -f1)
    
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "${GREEN}   File: ${COMPRESSED_FILE}${NC}"
    echo -e "${GREEN}   Size: ${SIZE}${NC}"
    
    # Cleanup old backups (keep last 30)
    cd $BACKUP_DIR
    ls -t *.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
    cd ..
    
    echo -e "${GREEN}🧹 Old backups cleaned (keeping last 30)${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Backup process completed!${NC}"
