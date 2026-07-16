CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT,
    "file_entry_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'review',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "deliverables_project_id_version_key" ON "deliverables"("project_id", "version");
CREATE INDEX "deliverables_organization_id_idx" ON "deliverables"("organization_id");
CREATE INDEX "deliverables_project_id_idx" ON "deliverables"("project_id");
CREATE INDEX "deliverables_task_id_idx" ON "deliverables"("task_id");
CREATE INDEX "deliverables_file_entry_id_idx" ON "deliverables"("file_entry_id");

ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_file_entry_id_fkey" FOREIGN KEY ("file_entry_id") REFERENCES "file_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
