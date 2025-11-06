# Quikount - Free Google Account Generator

A modern web application for generating temporary Google account credentials using Quiklabs. Built with Next.js, TypeScript, and Tailwind CSS, deployed on Vercel.

## Features

- 🚀 Generate single or multiple temporary Google accounts
- 📧 Random email addresses with customizable domains
- 🔐 Secure random password generation
- 👤 Random name and birth date generation
- 📋 One-click copy to clipboard
- 🎨 Beautiful, modern UI
- ⚡ Fast API endpoints
- ☁️ Ready for Vercel deployment

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Utilities**: Custom mirrors.js module

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Vercel account (for deployment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
quikount/
├── lib/
│   └── mirrors.js          # Account generation utilities
├── pages/
│   ├── api/
│   │   └── generate.ts     # API endpoint for account generation
│   ├── _app.tsx            # Next.js app component
│   └── index.tsx           # Main UI page
├── styles/
│   └── globals.css          # Global styles with Tailwind
├── package.json
├── tsconfig.json
├── next.config.js
└── vercel.json              # Vercel deployment config
```

## API Usage

### Generate Single Account

```bash
POST /api/generate
Content-Type: application/json

{
  "count": 1
}
```

### Generate Multiple Accounts

```bash
POST /api/generate
Content-Type: application/json

{
  "count": 5,
  "emailDomain": "tempmail.com",
  "passwordLength": 16
}
```

### Response

```json
{
  "success": true,
  "account": {
    "email": "example@tempmail.com",
    "password": "randomPassword123",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "birthDate": {
      "day": "15",
      "month": "06",
      "year": "1990"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "id": "unique-id"
  }
}
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Important Notes

⚠️ **Disclaimer**: This tool generates temporary account credentials for testing purposes. Please use responsibly and in accordance with Google's Terms of Service. Generated accounts are not automatically created on Google's servers.

## License

MIT

