-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'todo';

-- Backfill: align existing rows with the unified status vocabulary
-- (todo | in-progress | on-hold | done) used by the dashboard's task
-- panel and the standalone Tasks page alike.
UPDATE "tasks" SET "status" = 'todo' WHERE "status" = 'scheduled';
UPDATE "tasks" SET "status" = 'in-progress' WHERE "status" = 'review';
