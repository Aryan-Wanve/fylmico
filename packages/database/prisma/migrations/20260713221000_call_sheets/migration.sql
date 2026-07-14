-- CreateTable
CREATE TABLE "call_sheets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "shoot_date" TEXT NOT NULL,
    "general_call_time" TEXT NOT NULL,
    "location" TEXT,
    "weather" TEXT,
    "notes" TEXT,
    "crew_call_times" JSONB NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_sheets_organization_id_idx" ON "call_sheets"("organization_id");

-- CreateIndex
CREATE INDEX "call_sheets_project_id_idx" ON "call_sheets"("project_id");

-- AddForeignKey
ALTER TABLE "call_sheets" ADD CONSTRAINT "call_sheets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sheets" ADD CONSTRAINT "call_sheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sheets" ADD CONSTRAINT "call_sheets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security with no policies (default-deny), matching every
-- other table in the public schema (see the 20260711090257 migration) - the
-- backend connects directly via Prisma as the table-owning Postgres role,
-- which bypasses RLS regardless of whether it's enabled.
ALTER TABLE "call_sheets" ENABLE ROW LEVEL SECURITY;
