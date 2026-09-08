/*
  Warnings:

  - You are about to drop the `Todo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('U', 'A');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('U', 'C', 'R');

-- DropTable
DROP TABLE "Todo";

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "name" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'U',
    "facility_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "facility_id" SERIAL NOT NULL,
    "facility_name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200),

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("facility_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" SERIAL NOT NULL,
    "location_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "colors" (
    "color_id" SERIAL NOT NULL,
    "color_name" VARCHAR(20) NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("color_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(30) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "lost_items" (
    "lost_item_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "color_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "location_detail" VARCHAR(100),
    "lost_at" TIMESTAMP(3) NOT NULL,
    "secret_info" VARCHAR(200) NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'U',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lost_items_pkey" PRIMARY KEY ("lost_item_id")
);

-- CreateTable
CREATE TABLE "found_items" (
    "found_item_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "color_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "location_detail" VARCHAR(100),
    "found_at" TIMESTAMP(3) NOT NULL,
    "facility_id" INTEGER,
    "status" "ItemStatus" NOT NULL DEFAULT 'U',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "found_items_pkey" PRIMARY KEY ("found_item_id")
);

-- CreateTable
CREATE TABLE "matches" (
    "match_id" SERIAL NOT NULL,
    "lost_item_id" INTEGER NOT NULL,
    "found_item_id" INTEGER NOT NULL,
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("match_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "locations_location_name_key" ON "locations"("location_name");

-- CreateIndex
CREATE UNIQUE INDEX "colors_color_name_key" ON "colors"("color_name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "matches_lost_item_id_key" ON "matches"("lost_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_found_item_id_key" ON "matches"("found_item_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_items" ADD CONSTRAINT "lost_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_items" ADD CONSTRAINT "lost_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_items" ADD CONSTRAINT "lost_items_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("color_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_items" ADD CONSTRAINT "lost_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("color_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_lost_item_id_fkey" FOREIGN KEY ("lost_item_id") REFERENCES "lost_items"("lost_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_found_item_id_fkey" FOREIGN KEY ("found_item_id") REFERENCES "found_items"("found_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
