# Local setup

This guide explains how to run the Northstar Goods Voice Customer Service
Agent on a local machine.

## Prerequisites

Install the following:

- Node.js 20.9 or newer
- npm
- A modern browser such as Chrome or Edge
- Internet access
- An OpenAI API key with access to `gpt-audio-1.5`

## Install dependencies

Open PowerShell in the project directory:

```powershell
cd "C:\path\to\New-Voice-Agent"
npm install
```

## Configure the API key

Create a local environment file from the example:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set the server-side key:

```text
OPENAI_API_KEY=your-openai-api-key
```

Keep the key private. Do not put it in frontend code, browser storage,
screenshots, logs, commits, or chat exports. The `.env.local` file is ignored
by Git.

## Start the application

Run the development server:

```powershell
npm run dev
```

Open <http://localhost:3000>.

Available routes include:

- `/` — Northstar Goods storefront
- `/products` — complete product catalogue
- `/orders` — order history and manual order flow
- `/voice` — full-page voice customer-service experience

The floating **Talk to us** button opens the voice agent from the storefront.

## Use the voice agent

The voice agent accepts:

- `.mp3` files
- `.wav` files
- Browser recordings
- Drag-and-drop audio files

Browser recordings are converted to WAV on the client before upload. The
server sends the audio directly to `gpt-audio-1.5` using the official OpenAI
Node.js SDK. The application does not use Whisper or another separate
transcription service.

The agent can answer product and order questions and can process an order only
after the customer explicitly confirms the exact product, quantity, and total
price.

If a request fails, check the terminal running `npm run dev`. The server logs
the detailed OpenAI or tool error, and the browser displays the actionable
error message returned by the API.

## Run validation

Run the focused tests:

```powershell
npm run test:tools
npm run test:orders
npm run test:phase-2
npm run test:phase-4
```

Run project checks:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## Important limitations

- The OpenAI API key is required for live voice-agent requests.
- Orders are stored in process memory only. Restarting the server clears newly
  created orders.
- The project is independent from the `AutoEnquiry` project.
- No payment processing, authentication, shipping integration, or production
  database is included.
