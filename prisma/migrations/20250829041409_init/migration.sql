-- CreateEnum
CREATE TYPE "public"."priority" AS ENUM ('P1', 'P2', 'P3', 'P4', 'P5');

-- CreateTable
CREATE TABLE "public"."foreman" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foreman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weekly_detail" (
    "id" SERIAL NOT NULL,
    "title_task" TEXT NOT NULL,
    "location_id" INTEGER NOT NULL,
    "division_id" INTEGER NOT NULL,
    "start_date" DATE DEFAULT CURRENT_TIMESTAMP,
    "hole" VARCHAR(255),
    "detail" TEXT,
    "is_done" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."region" (
    "id" SERIAL NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" SERIAL NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bridge_dailyrep_dailydet" (
    "id" SERIAL NOT NULL,
    "dailyrep_id" INTEGER,
    "dailydet_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bridge_dailyrep_dailydet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bridge_weekrep_weekdet" (
    "id" SERIAL NOT NULL,
    "weekrep_id" INTEGER,
    "weekdet_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bridge_weekrep_weekdet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_detail" (
    "id" SERIAL NOT NULL,
    "weekdet_id" INTEGER,
    "title_task" TEXT NOT NULL,
    "location_id" INTEGER NOT NULL,
    "division_id" INTEGER NOT NULL,
    "priority" "public"."priority" NOT NULL DEFAULT 'P3',
    "hole" VARCHAR(255),
    "worker_need" INTEGER,
    "worker_avail" INTEGER,
    "worker_name" TEXT,
    "detail" TEXT,
    "url_photo" TEXT,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_report" (
    "id" SERIAL NOT NULL,
    "foreman_id" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "region_id" INTEGER NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."division" (
    "id" SERIAL NOT NULL,
    "division" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location" (
    "id" SERIAL NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weekly_report" (
    "id" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- AddForeignKey
ALTER TABLE "public"."foreman" ADD CONSTRAINT "fk_foreman_region" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."foreman" ADD CONSTRAINT "fk_foreman_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weekly_detail" ADD CONSTRAINT "fk_mingdet_division" FOREIGN KEY ("division_id") REFERENCES "public"."division"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."weekly_detail" ADD CONSTRAINT "fk_mingdet_location" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_dailyrep_dailydet" ADD CONSTRAINT "fk_bridgehar_hardet" FOREIGN KEY ("dailydet_id") REFERENCES "public"."daily_detail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_dailyrep_dailydet" ADD CONSTRAINT "fk_bridgehar_laphar" FOREIGN KEY ("dailyrep_id") REFERENCES "public"."daily_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_weekrep_weekdet" ADD CONSTRAINT "fk_bridgeming_lapming" FOREIGN KEY ("weekrep_id") REFERENCES "public"."weekly_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_weekrep_weekdet" ADD CONSTRAINT "fk_bridgeming_mingdet" FOREIGN KEY ("weekdet_id") REFERENCES "public"."weekly_detail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_detail" ADD CONSTRAINT "fk_hardet_division" FOREIGN KEY ("division_id") REFERENCES "public"."division"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_detail" ADD CONSTRAINT "fk_hardet_location" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_detail" ADD CONSTRAINT "fk_hardet_mingdet" FOREIGN KEY ("weekdet_id") REFERENCES "public"."weekly_detail"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report" ADD CONSTRAINT "fk_laphar_foreman" FOREIGN KEY ("foreman_id") REFERENCES "public"."foreman"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report" ADD CONSTRAINT "fk_laphar_region" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
