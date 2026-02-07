const EMAIL_VERIFICATION_KEYWORDS = ['confirm', 'confirmation', 'verified', 'verify', 'unverified'];
const EMAIL_VERIFICATION_FRIENDLY_MESSAGE =
  'Your email is not confirmed. Please check your inbox to confirm your email and start drafting.';

export const getFriendlyEmailVerificationMessage = (message?: string | null): string | null => {
  if (!message) return null;
  const normalized = message.toLowerCase();
  return EMAIL_VERIFICATION_KEYWORDS.some((keyword) => normalized.includes(keyword))
    ? EMAIL_VERIFICATION_FRIENDLY_MESSAGE
    : null;
};

export const getEmailVerificationFriendlyText = () => EMAIL_VERIFICATION_FRIENDLY_MESSAGE;

