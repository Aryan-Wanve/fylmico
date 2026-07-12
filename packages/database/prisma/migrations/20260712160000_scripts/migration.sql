-- CreateTable
CREATE TABLE "scripts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scripts_organization_id_idx" ON "scripts"("organization_id");

-- CreateIndex
CREATE INDEX "scripts_project_id_idx" ON "scripts"("project_id");

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security with no policies (default-deny), matching every
-- other table in the public schema (see the 20260711090257 migration).
ALTER TABLE "scripts" ENABLE ROW LEVEL SECURITY;

-- AlterTable: link a storyboard Board to an (optional) Script
ALTER TABLE "boards" ADD COLUMN "script_id" TEXT;

-- CreateIndex
CREATE INDEX "boards_script_id_idx" ON "boards"("script_id");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
