-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "commentable_type" TEXT NOT NULL,
    "commentable_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_organization_id_idx" ON "comments"("organization_id");

-- CreateIndex
CREATE INDEX "comments_commentable_type_commentable_id_idx" ON "comments"("commentable_type", "commentable_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
