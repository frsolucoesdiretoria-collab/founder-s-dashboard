#!/bin/bash
# Manual deployment script via SSH/rsync

# Load secrets from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Build first
npm run build

# Deploy
if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_USER" ] || [ -z "$REMOTE_TARGET" ]; then
  echo "Error: Missing deployment configuration. Set REMOTE_HOST, REMOTE_USER, and REMOTE_TARGET in .env"
  exit 1
fi

rsync -avz --delete dist/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_TARGET
echo "Deployed to $REMOTE_HOST:$REMOTE_TARGET"
