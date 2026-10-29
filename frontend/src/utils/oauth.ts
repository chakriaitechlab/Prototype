export const OAUTH_STATE_KEY = 'chakri_oauth_state';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ?? '';

type OAuthProvider = 'google' | 'linkedin';

export const oauthRedirectUri = (origin: string) => `${origin}/auth/callback`;

export function startOAuth(provider: OAuthProvider) {
  const state = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_STATE_KEY, `${provider}:${state}`);

  const { origin } = window.location;
  window.location.assign(
    provider === 'google' ? buildGoogleAuthUrl(origin, state) : buildLinkedInAuthUrl(origin, state),
  );
}

function buildGoogleAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: oauthRedirectUri(origin),
    response_type: 'id_token',
    scope: 'openid email profile',
    prompt: 'select_account',
    nonce: state,
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function buildLinkedInAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: oauthRedirectUri(origin),
    scope: 'openid profile email',
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}
