-- Switch email verification / password reset tokens from long opaque
-- link-tokens to short numeric OTP codes: drop the global uniqueness
-- constraint on the hash (a 6-digit code space collides across users) and
-- add an attempt counter to lock a code out after repeated guesses.
DROP INDEX "email_verification_tokens_token_hash_key";
ALTER TABLE "email_verification_tokens" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

DROP INDEX "password_reset_tokens_token_hash_key";
ALTER TABLE "password_reset_tokens" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
