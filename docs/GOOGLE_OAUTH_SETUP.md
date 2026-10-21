# Google Sign-In Setup — UK Hikers

> **Status: Pending configuration.** Google OAuth credentials must be supplied before Google Sign-In can be enabled in production.

## Planned authentication

UK Hikers will support both:
- Email and password
- Sign in with Google

The website and mobile app must authenticate against the same customer-account backend so that a customer's wishlist and saved preferences are shared across platforms.

## Configuration required later

- [ ] Create or select a Google Cloud project for UK Hikers.
- [ ] Configure the OAuth consent screen and publish/verify it as appropriate for the intended audience.
- [ ] Create the required OAuth client IDs for the website and mobile platforms.
- [ ] Add the authorized website origins and redirect URIs that match the final deployment configuration.
- [ ] Configure the required Android package name and signing certificate fingerprints, and iOS bundle identifier, if using native Google Sign-In.
- [ ] Add the resulting client IDs and any required server-side values to the appropriate environment configuration.
- [ ] Configure production secrets in the hosting provider; do not commit secrets or client secrets to Git.
- [ ] Test successful sign-in, cancellation, invalid credentials, account linking, and sign-out on web, Android, and iOS.
- [ ] Verify the backend validates Google ID tokens server-side, including issuer, audience, expiry, and signature, before creating or signing in a customer.
- [ ] Document production and local-development values separately.

## Implementation notes

- OAuth client IDs and redirect URIs are environment-specific and must be replaced with the actual values once configured.
- Do not use placeholder credentials as if they were valid configuration.
- Never put a Google client secret in the mobile app or any client-side bundle.
- Google authentication must create or resolve a **customer** account, not an administrator account.
- Keep the existing administrator authentication and booking/payment flow unchanged.
- The exact callback URLs, package identifiers, bundle identifiers, and environment variable names should be recorded here once the app identifiers and deployment URLs are finalized.

## Release checklist

Google Sign-In is not ready for production until the configuration above is completed and verified on all supported platforms.
