# NutriScan AI

**NutriScan AI helps you understand packaged food before you buy or eat it.** Take a photo of a label or scan a barcode to see a plain-language nutrition summary, ingredient notes, allergen information, and an AI-generated health score.

## Try NutriScan

Open the live app on a phone, tablet, or computer: **[nutri-scan-ai-olive.vercel.app](https://nutri-scan-ai-olive.vercel.app)**.

## What you can do

- **Analyze a food photo:** Use your camera or upload a picture of the package or nutrition label.
- **Scan a barcode:** Look up a packaged product and view its nutrition information.
- **Understand the result:** Review a health score and grade, nutrition facts, ingredients, additives, allergens, and helpful cautions.
- **Search and compare products:** Find foods and compare their nutrition information.
- **Save your scans:** Sign in to keep a profile, scan history, and favorites.
- **Make it your own:** Choose from supported languages and display settings, use speech features, and install the app on a compatible device.
- **Send feedback:** Share feedback with the NutriScan team.

NutriScan AI is for general food education. AI can make mistakes or miss details in a photo, so check the product packaging. It does not replace advice from a doctor or dietitian.

## How it works

The website is built with React and TypeScript. Its server handles requests to the Google Gemini API, which analyzes food photos and answers product questions. Firebase Authentication and Cloud Firestore support sign-in and saved user information. The app can also be installed as a Progressive Web App on supported devices.

## Run the project on your computer

### You will need

- Node.js 20 or newer
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- A Firebase project if you want to use sign-in and cloud-saved information

### Setup

1. Download or clone this repository, then open a terminal in the project folder.
2. Install the project packages:

   ```sh
   npm install
   ```

3. Create a file named `.env.local` in the project folder and add your own values:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ADMIN_PASSCODE=choose_a_private_passcode
   PORT=3000
   ```

   `GEMINI_API_KEY` is needed for AI features. Set a private `ADMIN_PASSCODE` before sharing a deployment. `PORT` is optional and defaults to `3000`. Keep `.env.local` private; never commit API keys or passwords to GitHub.

4. Add your Firebase web app settings to `firebase-applet-config.json`. In the Firebase console, enable the sign-in methods you want, add your site to Authentication's **Authorized domains**, and publish the included `firestore.rules` to your Firestore database.
5. Start the app:

   ```sh
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Build the project

Create the production build and run it locally with:

```sh
npm run build
npm start
```

The build creates the website in `dist/` and bundles the server alongside it.

## Deploy to Vercel

This repository is connected to the existing Vercel project. Updates pushed to the `main` branch trigger a deployment. The Vercel project serves the website and routes API requests to the server.

In Vercel Project Settings, add `GEMINI_API_KEY` as an environment variable for the environments you use. Firebase settings are read from `firebase-applet-config.json`; also make sure the production domain is listed in Firebase Authentication's **Authorized domains** and the Firestore rules are published to the correct Firebase project.

## Main technologies

- React, TypeScript, Vite, and Tailwind CSS
- Express for server API routes
- Google Gemini for AI food analysis and product help
- Firebase Authentication and Cloud Firestore for sign-in and saved data
- Vercel for hosting the live website and API

## Important files

- `src/` — website screens and app behavior
- `server.ts` — server API and Gemini requests
- `api/[...path].ts` — Vercel entry point for API requests
- `firebase-applet-config.json` — Firebase web app settings
- `firestore.rules` — access rules for Firestore data
- `.env.example` — environment variable template

## Environment variables

| Name | Needed for | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | AI features | Secret key used by the server to call Gemini. Keep it private. |
| `ADMIN_PASSCODE` | Admin area | Private passcode for admin tools. Choose your own value before deployment. |
| `PORT` | Local or server hosting | Server port. Defaults to `3000`; hosting services may set it automatically. |

`.env.local` and other `.env` files are ignored by Git. Only placeholder examples belong in `.env.example`.
