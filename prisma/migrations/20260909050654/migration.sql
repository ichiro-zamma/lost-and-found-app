/*
  Warnings:

  - The values [CONFIRMING] on the enum `ItemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemStatus_new" AS ENUM ('UNMATCHED', 'RETURNED');
ALTER TABLE "public"."found_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."lost_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "lost_items" ALTER COLUMN "status" TYPE "ItemStatus_new" USING ("status"::text::"ItemStatus_new");
ALTER TABLE "found_items" ALTER COLUMN "status" TYPE "ItemStatus_new" USING ("status"::text::"ItemStatus_new");
ALTER TYPE "ItemStatus" RENAME TO "ItemStatus_old";
ALTER TYPE "ItemStatus_new" RENAME TO "ItemStatus";
DROP TYPE "public"."ItemStatus_old";
ALTER TABLE "found_items" ALTER COLUMN "status" SET DEFAULT 'UNMATCHED';
ALTER TABLE "lost_items" ALTER COLUMN "status" SET DEFAULT 'UNMATCHED';
COMMIT;
