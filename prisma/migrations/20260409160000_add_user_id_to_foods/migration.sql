-- Add user_id column to foods (nullable first for backfill)
ALTER TABLE "foods" ADD COLUMN "user_id" TEXT REFERENCES "users"("id") ON DELETE CASCADE;

-- Backfill: assign orphaned foods to the first user (if any)
UPDATE "foods" SET "user_id" = (SELECT "id" FROM "users" LIMIT 1) WHERE "user_id" IS NULL;

-- Drop old index and create new one
DROP INDEX IF EXISTS "foods_name_idx";
CREATE INDEX "foods_user_id_name_idx" ON "foods"("user_id", "name");
