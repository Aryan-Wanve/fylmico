ALTER TABLE "clients" ADD COLUMN "logo_url" TEXT;
ALTER TABLE "clients" ADD COLUMN "phone" TEXT;
ALTER TABLE "clients" ADD COLUMN "address" TEXT;
ALTER TABLE "clients" ADD COLUMN "gst" TEXT;
ALTER TABLE "clients" ADD COLUMN "notes" TEXT;
ALTER TABLE "clients" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

ALTER TABLE "projects" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium';
