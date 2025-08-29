import type { laporan_mingguan } from "@prisma/client";

export const filterWeeklyPlanAttributes = (histories: laporan_mingguan[]) => {
  return histories.map((history: laporan_mingguan) => ({
    id: history.id,
    start_at: history.tanggal_mulai,
    end_at: history.tanggal_selesai,
  }));
};
