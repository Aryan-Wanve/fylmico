-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "assignee_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_organization_id_idx" ON "tasks"("organization_id");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_idx" ON "tasks"("assignee_id");

-- CreateIndex
CREATE INDEX "conversations_organization_id_idx" ON "conversations"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_organization_id_name_key" ON "conversations"("organization_id", "name");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_author_id_idx" ON "messages"("author_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
