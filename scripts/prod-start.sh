#!/usr/bin/env bash
set -e
cd /Volumes/AI/psw-reporting-production
export NODE_ENV=production
export PORT=3000
exec node .next/standalone/server.js
