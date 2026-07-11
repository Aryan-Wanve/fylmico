-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "cover_gradient" TEXT,
ADD COLUMN     "cover_icon" TEXT,
ADD COLUMN     "due_date" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'Development',
ADD COLUMN     "team_ids" TEXT[],
ADD COLUMN     "type" TEXT;
