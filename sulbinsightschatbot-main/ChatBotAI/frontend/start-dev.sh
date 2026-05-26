#!/bin/bash
# Frontend Quick Start Script for Mac/Linux

echo ""
echo "============================================"
echo " SULB Insights AI - Frontend Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed!"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "Node version:"
node --version
echo ""

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: npm install failed"
    exit 1
fi

echo ""
echo "============================================"
echo " Starting development server..."
echo "============================================"
echo ""
echo "Open your browser to: http://localhost:5173"
echo ""
echo "Make sure backend is running:"
echo "  python main.py (on another terminal)"
echo ""

npm run dev
