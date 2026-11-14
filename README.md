# NutriScan AI

NutriScan AI helps people understand packaged food before they buy or eat it. Scan a food label or barcode to get an AI-generated nutrition overview, health score, ingredient and additive notes, allergen warnings, and suitability guidance. The app also includes product search and comparison, saved scan history, user profiles, accessibility options, and an installable Progressive Web App experience.

## Features

- **Photo analysis:** Upload or capture a product label and receive a nutrition and ingredient analysis powered by Gemini.
- **Barcode analysis:** Scan a product barcode and request an AI product lookup and analysis.
- **Nutrition guidance:** Review health scores, nutrition facts, ingredients, additives, allergens, benefits, cautions, and suitability notes.
- **Search and compare:** Find products and compare their nutrition and health information.
- **Accounts and history:** Sign in, keep a profile, and save scans and favorites with Firebase-backed data where configured.
- **Admin and feedback tools:** Review app feedback and manage replies through the admin area.
- **Personalized experience:** Includes multiple languages, light and dark themes, speech support, and PWA installation.

AI-generated nutrition information is an aid for general education. Check the product packaging and consult a qualified professional for medical or dietary decisions.

## Technology

- React, TypeScript, Vite, and Tailwind CSS for the user interface
- Express and TypeScript for server-side API routes
- Google Gemini API for food analysis, barcode analysis, product questions, comparisons, and speech features
- Firebase Authentication and Cloud Firestore for account and scan data

## Requirements

- Node.js 20 or newer
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Firebase project configuration for Firebase-backed sign-in and cloud data

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env.local` in the project root and set your server-side secrets:

   ```env
   GEMINI_API_KEY=your_google_ai_studio_key
   ADMIN_PASSCODE=choose_a_private_admin_passcode
   PORT=3000
   ```

   `GEMINI_API_KEY` is required for Gemini-powered features. `ADMIN_PASSCODE` and `PORT` are optional; set a private admin passcode before sharing the app. Never commit `.env.local` or share API keys.

3. Configure `firebase-applet-config.json` with the Firebase web app configuration for your Firebase project. Enable the Firebase Authentication providers you intend to use and deploy the included Firestore rules to that project.

4. Start the development server:

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Build and run in production

```sh
npm run build
npm start
```

The build creates the Vite frontend in `dist/` and bundles the Express server as `dist/server.cjs`. The production host must run the Node server and provide `GEMINI_API_KEY` (and any desired `ADMIN_PASSCODE`) as server-side environment variables. This project is a Node/Express application; configure the host to run `npm run build` and `npm start`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes for AI features | Gemini API key. Keep it server-side and configure it as a local ignored environment file or host secret. |
| `ADMIN_PASSCODE` | No | Private passcode used by the admin area. Set your own value before deployment. |
| `PORT` | No | HTTP port. Defaults to `3000`; production hosts often provide this automatically. |

## Repository safety

`.env*` files are ignored by Git, with `.env.example` allowed as a placeholder template. Local data, dependencies, build output, and logs are also ignored. Do not commit API secrets, credentials, `node_modules/`, `dist/`, or `.data/`.
