-- CreateEnum
CREATE TYPE "public"."priority" AS ENUM ('P1', 'P2', 'P3', 'P4', 'P5');

-- CreateTable
CREATE TABLE "public"."mandor" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_region" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mandor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weekly_detail" (
    "id" SERIAL NOT NULL,
    "title_task" TEXT NOT NULL,
    "id_location" INTEGER NOT NULL,
    "id_division" INTEGER NOT NULL,
    "priority" "public"."priority" NOT NULL DEFAULT 'P3',
    "start_date" DATE DEFAULT CURRENT_TIMESTAMP,
    "hole" VARCHAR(255),
    "detail" TEXT,
    "is_done" BOOLEAN DEFAULT false,
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
    "id_role" INTEGER NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bridge_dailyrep_dailydet" (
    "id" SERIAL NOT NULL,
    "id_dailyrep" INTEGER,
    "id_dailydet" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bridge_dailyrep_dailydet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bridge_weekrep_weekdet" (
    "id" SERIAL NOT NULL,
    "id_weekrep" INTEGER,
    "id_weekdet" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bridge_weekrep_weekdet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_detail" (
    "id" SERIAL NOT NULL,
    "id_weekdet" INTEGER,
    "title_task" TEXT NOT NULL,
    "id_location" INTEGER NOT NULL,
    "id_division" INTEGER NOT NULL,
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
    "id_mandor" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_region" INTEGER NOT NULL,
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
ALTER TABLE "public"."mandor" ADD CONSTRAINT "fk_mandor_region" FOREIGN KEY ("id_region") REFERENCES "public"."region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."mandor" ADD CONSTRAINT "fk_mandor_users" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weekly_detail" ADD CONSTRAINT "fk_mingdet_division" FOREIGN KEY ("id_division") REFERENCES "public"."division"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."weekly_detail" ADD CONSTRAINT "fk_mingdet_location" FOREIGN KEY ("id_location") REFERENCES "public"."location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("id_role") REFERENCES "public"."role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_dailyrep_dailydet" ADD CONSTRAINT "fk_bridgehar_hardet" FOREIGN KEY ("id_dailydet") REFERENCES "public"."daily_detail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_dailyrep_dailydet" ADD CONSTRAINT "fk_bridgehar_laphar" FOREIGN KEY ("id_dailyrep") REFERENCES "public"."daily_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_weekrep_weekdet" ADD CONSTRAINT "fk_bridgeming_lapming" FOREIGN KEY ("id_weekrep") REFERENCES "public"."weekly_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_weekrep_weekdet" ADD CONSTRAINT "fk_bridgeming_mingdet" FOREIGN KEY ("id_weekdet") REFERENCES "public"."weekly_detail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_detail" ADD CONSTRAINT "fk_hardet_division" FOREIGN KEY ("id_division") REFERENCES "public"."division"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_detail" ADD CONSTRAINT "fk_hardet_location" FOREIGN KEY ("id_location") REFERENCES "public"."location"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_detail" ADD CONSTRAINT "fk_hardet_mingdet" FOREIGN KEY ("id_weekdet") REFERENCES "public"."weekly_detail"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report" ADD CONSTRAINT "fk_laphar_mandor" FOREIGN KEY ("id_mandor") REFERENCES "public"."mandor"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report" ADD CONSTRAINT "fk_laphar_region" FOREIGN KEY ("id_region") REFERENCES "public"."region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
