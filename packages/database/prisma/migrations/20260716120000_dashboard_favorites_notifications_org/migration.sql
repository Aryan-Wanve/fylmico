-- Dashboard favorite/pin/archive/reorder support.
ALTER TABLE "organization_memberships" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "organization_memberships" ADD COLUMN "favorited_at" TIMESTAMP(3);
ALTER TABLE "organization_memberships" ADD COLUMN "pinned_at" TIMESTAMP(3);
ALTER TABLE "organization_memberships" ADD COLUMN "archived_at" TIMESTAMP(3);

-- Cross-house notification deep-linking.
ALTER TABLE "notifications" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
