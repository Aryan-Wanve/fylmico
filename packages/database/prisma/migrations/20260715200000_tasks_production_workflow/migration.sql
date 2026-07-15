-- AlterTable: expand tasks with the new production-workflow fields
ALTER TABLE "tasks" ADD COLUMN "description" TEXT;
ALTER TABLE "tasks" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'custom';
ALTER TABLE "tasks" ADD COLUMN "start_date" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "estimated_minutes" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "recurrence_rule" TEXT;
ALTER TABLE "tasks" ADD COLUMN "recurrence_end_date" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "equipment" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "location" TEXT;
ALTER TABLE "tasks" ADD COLUMN "call_time" TEXT;
ALTER TABLE "tasks" ADD COLUMN "deliverables" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "project_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "board_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "script_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "shoot_day_event_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "created_by_id" TEXT;

-- Backfill created_by_id from the old single assignee (best available
-- proxy - the original schema never tracked a separate creator).
UPDATE "tasks" SET "created_by_id" = "assignee_id";
ALTER TABLE "tasks" ALTER COLUMN "created_by_id" SET NOT NULL;

-- Convert due_date from a plain date string to a real timestamp.
ALTER TABLE "tasks" ADD COLUMN "due_date_new" TIMESTAMP(3);
UPDATE "tasks" SET "due_date_new" = "due_date"::date;
ALTER TABLE "tasks" DROP COLUMN "due_date";
ALTER TABLE "tasks" RENAME COLUMN "due_date_new" TO "due_date";

-- Remap status vocab: done -> completed, on-hold -> todo (no "on-hold"
-- bucket in the new 6-status vocab; todo is the least-disruptive target).
UPDATE "tasks" SET "status" = 'completed' WHERE "status" = 'done';
UPDATE "tasks" SET "status" = 'todo' WHERE "status" = 'on-hold';

-- CreateTable: task_assignees (before the backfill insert below)
CREATE TABLE "task_assignees" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "responsibility" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "task_assignees_task_id_user_id_key" ON "task_assignees"("task_id", "user_id");
CREATE INDEX "task_assignees_user_id_idx" ON "task_assignees"("user_id");
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_assignees" ENABLE ROW LEVEL SECURITY;

-- Backfill the multi-assignee join table from the old single assignee,
-- carrying the old role snapshot over as the initial responsibility.
INSERT INTO "task_assignees" ("id", "task_id", "user_id", "responsibility", "created_at")
SELECT gen_random_uuid()::text, "id", "assignee_id", "role", "created_at" FROM "tasks";

-- Drop the old single-assignee/freeform-project columns.
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_fkey";
DROP INDEX "tasks_assignee_id_idx";
ALTER TABLE "tasks" DROP COLUMN "assignee_id";
ALTER TABLE "tasks" DROP COLUMN "role";
ALTER TABLE "tasks" DROP COLUMN "project";

-- New indexes/foreign keys for the new links.
CREATE INDEX "tasks_parent_task_id_idx" ON "tasks"("parent_task_id");
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");
CREATE INDEX "tasks_board_id_idx" ON "tasks"("board_id");
CREATE INDEX "tasks_script_id_idx" ON "tasks"("script_id");
CREATE INDEX "tasks_shoot_day_event_id_idx" ON "tasks"("shoot_day_event_id");
CREATE INDEX "tasks_created_by_id_idx" ON "tasks"("created_by_id");

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_shoot_day_event_id_fkey" FOREIGN KEY ("shoot_day_event_id") REFERENCES "calendar_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: file_entries gains an optional task link (attachments +
-- linked Drive files use the same mechanism as conversation_id).
ALTER TABLE "file_entries" ADD COLUMN "task_id" TEXT;
CREATE INDEX "file_entries_task_id_idx" ON "file_entries"("task_id");
ALTER TABLE "file_entries" ADD CONSTRAINT "file_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "task_checklist_items" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_checklist_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "task_checklist_items_task_id_idx" ON "task_checklist_items"("task_id");
ALTER TABLE "task_checklist_items" ADD CONSTRAINT "task_checklist_items_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_checklist_items" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" TEXT NOT NULL,
    "blocking_task_id" TEXT NOT NULL,
    "blocked_task_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "task_dependencies_blocking_task_id_blocked_task_id_key" ON "task_dependencies"("blocking_task_id", "blocked_task_id");
CREATE INDEX "task_dependencies_blocked_task_id_idx" ON "task_dependencies"("blocked_task_id");
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_blocking_task_id_fkey" FOREIGN KEY ("blocking_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_blocked_task_id_fkey" FOREIGN KEY ("blocked_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_dependencies" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "task_activity" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "from_value" TEXT,
    "to_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_activity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "task_activity_task_id_idx" ON "task_activity"("task_id");
ALTER TABLE "task_activity" ADD CONSTRAINT "task_activity_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_activity" ADD CONSTRAINT "task_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "task_activity" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "task_time_entries" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_time_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "task_time_entries_task_id_idx" ON "task_time_entries"("task_id");
CREATE INDEX "task_time_entries_user_id_idx" ON "task_time_entries"("user_id");
ALTER TABLE "task_time_entries" ADD CONSTRAINT "task_time_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_time_entries" ADD CONSTRAINT "task_time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_time_entries" ENABLE ROW LEVEL SECURITY;
