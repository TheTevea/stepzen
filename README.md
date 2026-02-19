<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This is a Next.js application for Stepzen - an internship platform for developers.

View your app in AI Studio: https://ai.studio/apps/drive/16emjVajZZfjyHopFRq3F-dPuhsGHf54l

## Run Locally

**Prerequisites:**  Node.js 18+ 


1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (optional)
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

To create a production build:

```bash
npm run build
```

To run the production build:

```bash
npm start
```

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Icons:** Lucide React
- **Font:** Google Fonts (Inter & Bricolage Grotesque)

## Features

- Browse internship opportunities
- Filter by location, type, and category
- Search by role, company, or skill
- View detailed job descriptions
- Apply via Telegram or website form
- User authentication (mock implementation)
- Responsive design with neobrutalism UI

## Migration Notes

This app was successfully migrated from React.js (with Vite) to Next.js 16, maintaining all functionality and UI design.
