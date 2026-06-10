# Green Leaf AI Receptionist - Setup & Deployment Guide

## Overview
This is a fully functional AI voice receptionist for Green Leaf cleaning and construction services. It:
- Answers incoming calls 24/7
- Uses Claude AI for natural conversation
- Collects customer information
- Sends leads directly to your email
- Handles booking requests

## Quick Start (30 minutes)

### Step 1: Get Required API Keys

#### A) Anthropic Claude API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Create a new API key
4. Copy it (you'll need it in Step 4)

#### B) Gmail App Password (for email notifications)
1. Go to https://myaccount.google.com
2. Click "Security" on the left
3. Enable 2-Factor Authentication (if not enabled)
4. Go back to Security → App passwords
5. Select "Mail" and "Windows Computer"
6. Google generates a 16-character password
7. Copy this password (you'll need it in Step 4)

### Step 2: Deploy to Vercel

1. **Create a Vercel Account** (if you don't have one)
   - Go to https://vercel.com
   - Sign up with your GitHub, GitLab, or email

2. **Prepare Your Code**
   - Create a new folder on your computer
   - Copy the following files into it:
     - `server.js`
     - `package.json`
     - `.env.example` (rename to `.env.local` after copying)

3. **Create a GitHub Repository** (easiest way to deploy)
   - Go to https://github.com/new
   - Create a new repo (name it "green-leaf-receptionist")
   - Upload the files
   - OR: Use Vercel's direct upload feature

4. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Select "Other - Git Repository"
   - Paste your GitHub repo URL
   - Click "Import"
   - Set environment variables (see Step 3 below)
   - Click "Deploy"

### Step 3: Set Environment Variables in Vercel

After clicking "Deploy", you'll see an "Environment Variables" section.
Add these (exact same keys and values):
