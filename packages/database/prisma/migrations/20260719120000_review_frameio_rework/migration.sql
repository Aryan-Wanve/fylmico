-- AlterTable: Comment threading, resolve, reactions, mentions, pin
ALTER TABLE "comments" ADD COLUMN "parent_id" TEXT;
ALTER TABLE "comments" ADD COLUMN "frame_number" INTEGER;
ALTER TABLE "comments" ADD COLUMN "mentioned_user_ids" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "comments" ADD COLUMN "reactions" JSONB;
ALTER TABLE "comments" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "comments" ADD COLUMN "resolved_at" TIMESTAMP(3);
ALTER TABLE "comments" ADD COLUMN "resolved_by_id" TEXT;

CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Deliverable rejection reason + first-reviewed tracking
ALTER TABLE "deliverables" ADD COLUMN "rejection_reason" TEXT;
ALTER TABLE "deliverables" ADD COLUMN "first_reviewed_at" TIMESTAMP(3);

-- Close the version-numbering race (deliverables.service.ts's create() used
-- to count-then-create with no constraint backstop): one version number
-- per task across all its deliverable submissions. Task-less (client/
-- project-only) deliverables aren't part of a review cycle, so they're
-- excluded from the constraint.
CREATE UNIQUE INDEX "deliverables_task_id_version_key" ON "deliverables"("task_id", "version") WHERE "task_id" IS NOT NULL;

-- CreateTable: Annotation
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "deliverable_id" TEXT NOT NULL,
    "comment_id" TEXT,
    "author_id" TEXT NOT NULL,
    "timestamp_seconds" DOUBLE PRECISION NOT NULL,
    "frame_number" INTEGER,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "annotations_deliverable_id_idx" ON "annotations"("deliverable_id");

ALTER TABLE "annotations" ADD CONSTRAINT "annotations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "annotations" ENABLE ROW LEVEL SECURITY;

-- CreateTable: DeliverableActivity (mirrors task_activity)
CREATE TABLE "deliverable_activity" (
    "id" TEXT NOT NULL,
    "deliverable_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "from_value" TEXT,
    "to_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deliverable_activity_deliverable_id_idx" ON "deliverable_activity"("deliverable_id");

ALTER TABLE "deliverable_activity" ADD CONSTRAINT "deliverable_activity_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliverable_activity" ADD CONSTRAINT "deliverable_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deliverable_activity" ENABLE ROW LEVEL SECURITY;
