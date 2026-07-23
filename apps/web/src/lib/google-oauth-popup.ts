export const GOOGLE_OAUTH_MESSAGE_SOURCE = "fylmico-google-oauth";

export type GoogleOAuthMessage =
  | {
      source: typeof GOOGLE_OAUTH_MESSAGE_SOURCE;
      success: true;
      accessToken: string;
      refreshToken: string;
    }
  | {
      source: typeof GOOGLE_OAUTH_MESSAGE_SOURCE;
      success: false;
      error: string;
    };

// window.opener is only ever set on a window opened via window.open() - a
// normal top-level navigation (including a popup-blocked fallback redirect)
// never has it. Used by /auth/callback to decide whether to postMessage the
// result back to its opener and close, or navigate itself as before.
export function isGoogleOAuthPopup(): boolean {
  return (
    typeof window !== "undefined" &&
    window.opener != null &&
    window.opener !== window
  );
}
