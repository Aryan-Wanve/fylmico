ALTER TABLE "conversations" ADD COLUMN "project_id" TEXT;
CREATE UNIQUE INDEX "conversations_project_id_key" ON "conversations"("project_id");
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
