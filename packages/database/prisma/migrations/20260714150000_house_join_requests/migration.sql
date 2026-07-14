-- CreateTable
CREATE TABLE "house_join_requests" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "responded_by_id" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "house_join_requests_organization_id_user_id_key" ON "house_join_requests"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "house_join_requests_organization_id_idx" ON "house_join_requests"("organization_id");

-- CreateIndex
CREATE INDEX "house_join_requests_user_id_idx" ON "house_join_requests"("user_id");

-- AddForeignKey
ALTER TABLE "house_join_requests" ADD CONSTRAINT "house_join_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_join_requests" ADD CONSTRAINT "house_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_join_requests" ADD CONSTRAINT "house_join_requests_responded_by_id_fkey" FOREIGN KEY ("responded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "house_join_requests" ENABLE ROW LEVEL SECURITY;
