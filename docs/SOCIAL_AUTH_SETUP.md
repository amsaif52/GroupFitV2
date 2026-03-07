# Social login setup (Google & Apple)

## Backend (API)

1. **Environment variables** (e.g. in `.env` or your host):
   - `GOOGLE_CLIENT_ID` – OAuth 2.0 **Web client** ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Used to verify the Google ID token.
   - `APPLE_CLIENT_ID` – Your **Services ID** (or App Bundle ID) from [Apple Developer](https://developer.apple.com/account/resources/identifiers/list). Used to verify the Apple identity token.

2. **Database**: Run the migration so the `User` table has `google_id`, `apple_id`, and optional `password_hash`:

   ```bash
   cd apps/api && npx prisma migrate dev --name add_social_auth
   ```

   If you prefer to apply SQL yourself, see `apps/api/prisma/migrations/` (if present) or the schema changes in `apps/api/prisma/schema.prisma`.

3. **Endpoints**:
   - `POST /auth/google` – body: `{ idToken: string, role?: 'customer' | 'trainer' | 'admin' }`. Verifies the Google ID token, finds or creates the user, returns JWT.
   - `POST /auth/apple` – body: `{ idToken: string, role?: 'customer' | 'trainer' | 'admin' }`. Same for Apple identity token.

## Web app

- **Google**: Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the same **Web client** ID as the backend. The login/signup pages use `@react-oauth/google` to get the ID token and send it to `POST /auth/google`.
- **Apple**: Not wired on web yet; you can add Sign in with Apple JS and then call `POST /auth/apple` with the identity token.

## React Native (Expo) apps

- **API base URL**: Set `EXPO_PUBLIC_API_URL` (e.g. `https://your-api.com/api`) so the app can call the backend. Default is `http://localhost:3001/api`.
- **Google**:
  - Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the same **Web client** ID as the backend (used for server-side verification).
  - Configure the native Google Sign-In (e.g. [Expo config plugin](https://www.npmjs.com/package/@react-native-google-signin/google-signin) or manual iOS/Android setup).
- **Apple**: Sign in with Apple is implemented on **iOS** only (`expo-apple-authentication`). No extra env vars; ensure your Apple App ID has the “Sign in with Apple” capability.

## Flow summary

1. **Web**: User clicks “Continue with Google” → Google Identity Services returns an ID token → frontend sends it to `POST /auth/google` → backend verifies token, finds/creates user, returns JWT → frontend stores token and redirects to dashboard.
2. **RN**: User taps “Continue with Google” or “Continue with Apple” → native SDK returns ID/identity token → app sends it to `POST /auth/google` or `POST /auth/apple` → backend returns JWT → app stores token and navigates to home.
