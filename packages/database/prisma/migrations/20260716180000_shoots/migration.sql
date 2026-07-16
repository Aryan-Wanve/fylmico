CREATE TABLE "shoots" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "calendar_event_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduled_date" TEXT NOT NULL,
    "call_time" TEXT,
    "location" TEXT,
    "equipment" TEXT[],
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "cancel_reason" TEXT,
    "cancel_notes" TEXT,
    "reached_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shoots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shoots_organization_id_idx" ON "shoots"("organization_id");
CREATE INDEX "shoots_project_id_idx" ON "shoots"("project_id");
CREATE INDEX "shoots_calendar_event_id_idx" ON "shoots"("calendar_event_id");

ALTER TABLE "shoots" ADD CONSTRAINT "shoots_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_calendar_event_id_fkey" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD COLUMN "shoot_id" TEXT;
CREATE INDEX "tasks_shoot_id_idx" ON "tasks"("shoot_id");
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_shoot_id_fkey" FOREIGN KEY ("shoot_id") REFERENCES "shoots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
