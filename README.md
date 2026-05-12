# Prana LP Intake

A public-facing Next.js app for collecting prospective LP information and SPV data.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`.

## Deployment

Deploy this project to Vercel or another Next.js host.

### Recommended environment variables

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_EMAIL`

### Regional access tokens

This form supports geography-based access token prefixes, so you can issue region tokens instead of one token per investor. Example prefixes:

- `US-` for North America
- `EMEA-` for Europe / Middle East / Africa
- `APAC-` for Asia Pacific
- `LATAM-` for Latin America

If SMTP variables are not configured, submission will return an error and the server log will show details.
