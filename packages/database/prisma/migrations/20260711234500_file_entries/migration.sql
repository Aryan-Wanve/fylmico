-- CreateTable
CREATE TABLE "file_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storage_path" TEXT,
    "size" INTEGER,
    "mime_type" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_entries_organization_id_idx" ON "file_entries"("organization_id");

-- CreateIndex
CREATE INDEX "file_entries_parent_id_idx" ON "file_entries"("parent_id");

-- AddForeignKey
ALTER TABLE "file_entries" ADD CONSTRAINT "file_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_entries" ADD CONSTRAINT "file_entries_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "file_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_entries" ADD CONSTRAINT "file_entries_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security with no policies (default-deny), matching every
-- other table in the public schema (see the 20260711090257 migration) - the
-- backend connects directly via Prisma as the table-owning Postgres role,
-- which bypasses RLS regardless of whether it's enabled.
ALTER TABLE "file_entries" ENABLE ROW LEVEL SECURITY;
