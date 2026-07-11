-- CreateTable
CREATE TABLE "house_invitations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_by_id" TEXT,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "house_invitations_token_hash_key" ON "house_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "house_invitations_organization_id_idx" ON "house_invitations"("organization_id");

-- CreateIndex
CREATE INDEX "house_invitations_email_idx" ON "house_invitations"("email");

-- AddForeignKey
ALTER TABLE "house_invitations" ADD CONSTRAINT "house_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_invitations" ADD CONSTRAINT "house_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_invitations" ADD CONSTRAINT "house_invitations_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable Row Level Security with no policies (default-deny), matching every
-- other table in the public schema (see the 20260711090257 migration) - the
-- backend connects directly via Prisma as the table-owning Postgres role,
-- which bypasses RLS regardless of whether it's enabled.
ALTER TABLE "house_invitations" ENABLE ROW LEVEL SECURITY;
