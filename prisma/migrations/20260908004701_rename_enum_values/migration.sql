/*
  Warnings:

  - The values [U,C,R] on the enum `ItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [U,A] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemStatus_new" AS ENUM ('UNMATCHED', 'CONFIRMING', 'RETURNED');
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

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "found_items" ALTER COLUMN "status" SET DEFAULT 'UNMATCHED';

-- AlterTable
ALTER TABLE "lost_items" ALTER COLUMN "status" SET DEFAULT 'UNMATCHED';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
