#!/bin/bash
cd backend && npm install
cd ../frontend && npm install
( cd ../backend && node index.js ) &
( cd ../frontend && npm run dev ) &
echo started
