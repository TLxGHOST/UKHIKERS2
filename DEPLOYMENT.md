# UK Hikers Deployment Checklist

This guide assumes the frontend is deployed on Vercel and the Express backend on Render (or another Node.js host).

## 1. Backend service

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health-check path: `/health`
- Set the following environment variables in the backend host dashboard. Do not commit real values.

| Variable | Purpose |
| --- | --- |
| `PORT` | Usually assigned automatically by the hosting platform; omit if the platform provides it |
| `MONGO_URI` | Production MongoDB connection string |
| `JWT_SECRET` | Long, random secret used to sign admin tokens |
| `RAZORPAY_KEY_ID` | Razorpay key ID for the intended environment |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `EMAIL_HOST` | SMTP host, e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | `587` for STARTTLS or `465` for implicit TLS |
| `EMAIL_USER` | Sender Gmail address |
| `EMAIL_PASS` | Google App Password, not the regular Gmail password |
| `EMAIL_FROM` | Sender address accepted by the SMTP provider; usually the same Gmail address |
| `FRONTEND_URL` | Exact deployed frontend origin, e.g. `https://your-site.vercel.app` |

For Gmail, enable 2-Step Verification and create an App Password. Verify outbound SMTP is permitted by the hosting provider.

## 2. Frontend service

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend-host>/api`

Vite variables are compiled into the client bundle at build time. Set `VITE_API_URL` before building/redeploying the frontend. Never put SMTP, MongoDB, JWT, or Razorpay secret values in frontend variables.

For a Vercel SPA using React Router, configure rewrites so deep links serve `index.html` if the project does not already have that behavior.

## 3. Database and payments

- Use a production MongoDB database and allow connections from the backend host.
- Use Razorpay test credentials while validating the deployed flow. Switch to live credentials only after end-to-end verification.
- Confirm Razorpay's configured callback/webhook URLs (if used) point to the deployed backend and are protected/verified as required by the integration.

## 4. Verify after deployment

1. Open `https://<your-backend-host>/health`; expect HTTP 200 and a small JSON health response.
2. Load the deployed frontend and confirm API requests target the deployed backend, not localhost.
3. Submit a test booking and confirm it remains pending without charging the customer.
4. Approve it in the admin panel and verify seats are reserved and the approval email/invoice arrives.
5. Test the approved-booking checkout using Razorpay test mode, then verify the payment receipt email.
6. Test the admin **Test email setup** action and inspect backend logs if SMTP fails.
7. Confirm admin login, booking tracking, invoice download, and CORS work on the deployed domain.

## 5. Security reminders

- Keep `.env` files and all secrets out of Git.
- Use separate test and live Razorpay keys.
- Use a strong, unique `JWT_SECRET`.
- Set `FRONTEND_URL` to the exact production frontend origin (comma-separated if multiple origins are intentionally supported).
- A successful SMTP submission does not guarantee inbox placement; check spam and provider logs if needed.
