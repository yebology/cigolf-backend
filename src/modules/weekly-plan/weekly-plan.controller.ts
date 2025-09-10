import { Response, Request } from "express";
import { WeeklyPlanService } from "./weekly-plan.service";
import {
  filterWeeklyPlanAttributes,
  flattenReport,
  formatDateUTC7,
  generatePdfFromCsv,
} from "./weekly-plan.helper";
import archiver from "archiver";
import { stringify } from "csv-stringify/sync";

const service = new WeeklyPlanService();

export const getWeeklyPlanHistories = async (req: Request, res: Response) => {
  try {
    const { start_at, end_at } = req.query;
    let result;
    if (start_at && end_at) {
      result = await service.getFilteredWeeklyPlanHistories(
        start_at.toString(),
        end_at.toString()
      );
    } else if (!start_at && !end_at) {
      result = await service.getWeeklyPlanHistories();
    } else {
      return res
        .status(422)
        .json({ status: "error", message: "invalid params" });
    }

    return res.json({
      status: "success",
      message: "Weekly plan fetch successfuly.",
      data: filterWeeklyPlanAttributes(result),
    });
  } catch (error) {
    return res
      .status(422)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getWeeklyPlanDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await service.getWeeklyPlanDetails(id);

    res.json({
      status: "success",
      message: "Weekly plan fetch successfuly.",
      data: result,
    });
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const createWeeklyPlan = async (req: Request, res: Response) => {
  try {
    await service.createWeeklyPlan(req.body);

    res.json({
      status: "success",
      message: "Weekly plan successfully created",
    });
  } catch (error) {
    console.log(error);
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: [
        {
          day: [(error as Error).message],
        },
      ],
    });
  }
};

export const exportFile = async (req: Request, res: Response) => {
  try {
    const { type, weekly_ids } = req.query;

    let weeklyIds: number[] = [];
    if (typeof weekly_ids === "string") {
      try {
        weeklyIds = JSON.parse(weekly_ids);
      } catch (e) {
        throw new Error("invalid json weekly ids");
      }
    }

    if (String(type) != "csv" && String(type) != "pdf") {
      throw new Error("invalid type");
    }

    const allReports = await service.exportFile(weeklyIds);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=weekly_reports.zip"
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (let idx = 0; idx < allReports!.length; idx++) {
      const report = allReports![idx];
      const flat = flattenReport(report);

      const csv = stringify(flat, {
        header: true,
        columns: {
          id: "No",
          // startAt: "Tanggal Mulai",
          // endAt: "Tanggal Selesai",
          division: "Divisi",
          location: "Lokasi",
          taskType: "Tipe Tugas",
          day: "Hari",
          description: "Deskripsi",
          area: "Area",
        },
        quoted: true,
      });

      if (type === "csv") {
        archive.append(csv, {
          name: `Laporan Mingguan ${formatDateUTC7(report.startAt)} - ${formatDateUTC7(report.endAt)} (${report.id}).csv`,
        });
      } else if (type === "pdf") {
        const pdfBuffer = await generatePdfFromCsv(csv, weeklyIds[idx]);
        archive.append(pdfBuffer, {
          name: `Laporan Mingguan ${weeklyIds[idx]}.pdf`,
        });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat export file");
  }
};
