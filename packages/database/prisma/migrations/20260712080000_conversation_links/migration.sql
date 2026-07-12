-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "conversation_id" TEXT;

-- AlterTable
ALTER TABLE "calendar_events" ADD COLUMN "conversation_id" TEXT;

-- AlterTable
ALTER TABLE "file_entries" ADD COLUMN "conversation_id" TEXT;

-- CreateIndex
CREATE INDEX "tasks_conversation_id_idx" ON "tasks"("conversation_id");

-- CreateIndex
CREATE INDEX "calendar_events_conversation_id_idx" ON "calendar_events"("conversation_id");

-- CreateIndex
CREATE INDEX "file_entries_conversation_id_idx" ON "file_entries"("conversation_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_entries" ADD CONSTRAINT "file_entries_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
