@echo off
title Timeline
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call pnpm install
)

start "" http://localhost:3000
call pnpm dev
