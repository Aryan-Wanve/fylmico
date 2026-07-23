-- Client comments: allow a non-Fylmico "client" author alongside the
-- existing required User author, and tag which review session (if any)
-- a comment was left through.
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_fkey";
ALTER TABLE "comments" ALTER COLUMN "author_id" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN     "author_type" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "comments" ADD COLUMN     "guest_name" TEXT;
ALTER TABLE "comments" ADD COLUMN     "guest_email" TEXT;
ALTER TABLE "comments" ADD COLUMN     "review_session_id" TEXT;

-- Deliverable activity: allow a non-Fylmico "client" actor alongside the
-- existing required User actor.
ALTER TABLE "deliverable_activity" DROP CONSTRAINT "deliverable_activity_actor_id_fkey";
ALTER TABLE "deliverable_activity" ALTER COLUMN "actor_id" DROP NOT NULL;
ALTER TABLE "deliverable_activity" ADD COLUMN     "actor_type" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "deliverable_activity" ADD COLUMN     "actor_label" TEXT;

-- CreateTable
CREATE TABLE "review_sessions" (
    "id" TEXT NOT NULL,
    "deliverable_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT,
    "include_project_name" BOOLEAN NOT NULL DEFAULT true,
    "include_video_version" BOOLEAN NOT NULL DEFAULT true,
    "include_notes" BOOLEAN NOT NULL DEFAULT false,
    "allow_download" BOOLEAN NOT NULL DEFAULT false,
    "allow_fullscreen" BOOLEAN NOT NULL DEFAULT true,
    "allow_version_switch" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "first_viewed_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "changes_requested_at" TIMESTAMP(3),
    "sent_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_otp_tokens" (
    "id" TEXT NOT NULL,
    "review_session_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_review_session_id_idx" ON "comments"("review_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_sessions_token_hash_key" ON "review_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "review_sessions_deliverable_id_idx" ON "review_sessions"("deliverable_id");

-- CreateIndex
CREATE INDEX "review_sessions_organization_id_idx" ON "review_sessions"("organization_id");

-- CreateIndex
CREATE INDEX "review_otp_tokens_review_session_id_idx" ON "review_otp_tokens"("review_session_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_review_session_id_fkey" FOREIGN KEY ("review_session_id") REFERENCES "review_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverable_activity" ADD CONSTRAINT "deliverable_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_sent_by_id_fkey" FOREIGN KEY ("sent_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_otp_tokens" ADD CONSTRAINT "review_otp_tokens_review_session_id_fkey" FOREIGN KEY ("review_session_id") REFERENCES "review_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
