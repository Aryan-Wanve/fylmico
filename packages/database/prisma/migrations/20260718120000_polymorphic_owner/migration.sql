-- Polymorphic ownership: work belongs to EITHER a Project OR a Client (ADR 0059).
-- Adds client_id alongside project_id on the owner-polymorphic tables, makes
-- the previously-required project_id nullable on shoots/deliverables, drops the
-- project<->client association table, and enforces the "exactly one owner"
-- (or "at most one owner", where an unowned row is allowed) invariant.

-- Drop the per-project version uniqueness (versioning is now per-owner in code).
DROP INDEX "deliverables_project_id_version_key";

-- project_id is no longer required on shoots/deliverables (a client can own them).
ALTER TABLE "shoots" ALTER COLUMN "project_id" DROP NOT NULL;
ALTER TABLE "deliverables" ALTER COLUMN "project_id" DROP NOT NULL;

-- New owner column on each owner-polymorphic table.
ALTER TABLE "tasks" ADD COLUMN "client_id" TEXT;
ALTER TABLE "shoots" ADD COLUMN "client_id" TEXT;
ALTER TABLE "deliverables" ADD COLUMN "client_id" TEXT;
ALTER TABLE "calendar_events" ADD COLUMN "client_id" TEXT;

CREATE INDEX "tasks_client_id_idx" ON "tasks"("client_id");
CREATE INDEX "shoots_client_id_idx" ON "shoots"("client_id");
CREATE INDEX "deliverables_client_id_idx" ON "deliverables"("client_id");
CREATE INDEX "calendar_events_client_id_idx" ON "calendar_events"("client_id");

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The project<->client association is removed: they are now independent.
DROP TABLE "project_clients";

-- Ownership invariants. Deliverables and shoots must have exactly one owner;
-- tasks and calendar events may be unowned (0) but never dual-owned.
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_one_owner" CHECK (num_nonnulls("project_id", "client_id") = 1);
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_one_owner" CHECK (num_nonnulls("project_id", "client_id") = 1);
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_one_owner" CHECK (num_nonnulls("project_id", "client_id") <= 1);
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_one_owner" CHECK (num_nonnulls("project_id", "client_id") <= 1);
