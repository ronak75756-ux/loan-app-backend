# Deploying Backend to Render

This guide will help you deploy your Node.js backend to Render so your mobile app can access it.

## 1. Push Code to GitHub

Since I have already initialized git and committed your files, you just need to push to a GitHub repository.

1.  Create a new **empty** repository on GitHub (e.g., named `loan-manager`).
2.  Run the following commands in your terminal (inside `d:\LoanApp2`):

    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/loan-manager.git
    git branch -M main
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` and `loan-manager` with your actual details)*

## 2. Deploy to Render

1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub account and select the `loan-manager` repository.
4.  Configure the service:
    *   **Name:** `loan-app-backend` (or anything you like)
    *   **Region:** Choose one close to you (e.g., Singapore, Oregon).
    *   **Branch:** `main`
    *   **Root Directory:** `backend-js`  <-- **IMPORTANT**
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
    *   **Free Instance Type:** Yes

5.  Click **"Create Web Service"**.

## 3. Important Note on Data

Your backend uses a local file (`data.json`) to store data.
*   **On Render (Free Tier):** This file is **ephemeral**. If the server restarts (which happens often on free tier), **you will lose your data** and it will reset to the empty state.
*   **Solution:** For a real app, you should use a database like MongoDB or PostgreSQL. For testing, just be aware that data might disappear.

## 4. Connect Frontend

Once deployed, Render will give you a URL (e.g., `https://loan-app-backend.onrender.com`).

1.  Copy that URL.
2.  Open `d:\LoanApp2\frontend\src\services\api.js`.
3.  Update `API_BASE_URL` with your new Render URL.
4.  Rebuild your app: `npm run build`
5.  Sync Capacitor: `npx cap sync`
6.  Build APK: `gradlew assembleDebug`
