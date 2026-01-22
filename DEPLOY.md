# How to Share Your Cognitive Assessment App

Since this app uses the **Microphone** (for the Language Test), it requires a **Secure Context (HTTPS)** to work on other devices. Browsers block microphone access on insecure (HTTP) connections unless you are on `localhost`.

## Option 1: Vercel (Recommended & Easiest)
This creates a permanent, secure link (e.g., `your-app.vercel.app`) that supports the microphone.

1.  **Push your latest code to GitHub** (You just did this!).
2.  Go to [Vercel.com](https://vercel.com) and sign up/login with GitHub.
3.  Click **"Add New..."** -> **"Project"**.
4.  Select your `cognitive-app` repository.
5.  Click **Deploy**.
6.  Wait ~1 minute. You will get a link to share with your friend.

## Option 2: Temporary Tunnel (ngrok)
Good for quick testing if you don't want to deploy yet.

1.  Install ngrok: `npm install -g ngrok`
2.  Start your app locally: `npm run dev`
3.  In a **new terminal**, run: `ngrok http 5173`
4.  Copy the `https://...` link and share it.

> **Note:** The free version of ngrok serves a warning page that might look scary to users.

## Option 3: Local Network (Same Wi-Fi Only)
If your friend is in the same room on the same Wi-Fi:

1.  Run `npm run dev -- --host`
2.  Your terminal will show a "Network" URL (e.g., `http://192.168.1.5:5173`).
3.  **Warning:** Microphone WILL NOT WORK on mobile devices with this method because it's http, not https. Chrome/Safari will block it.
