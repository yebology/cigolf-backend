import { Response, Request } from "express";
import { WeeklyPlanService } from "./weekly-plan.service";
import {
  filterWeeklyPlanAttributes,
  flattenReport,
} from "./weekly-plan.helper";
import archiver from "archiver";
import { stringify } from "csv-stringify/sync";
import PDFDocument from "pdfkit";

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
        console.error("weekly_ids bukan JSON valid:", weekly_ids);
      }
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

      if (type === "csv") {
        // === CSV ===
        const csv = stringify(flat, {
          header: true,
          columns: {
            id: "No",
            startAt: "Tanggal Mulai",
            endAt: "Tanggal Selesai",
            division: "Divisi",
            location: "Lokasi",
            taskType: "Tipe Tugas",
            day: "Hari",
            description: "Deskripsi",
            area: "Area",
          },
        });
        archive.append(csv, { name: `Laporan Mingguan ${weeklyIds[idx]}.csv` });
      } else if (type === "pdf") {
        // === PDF ===
        const doc = new PDFDocument({ margin: 30 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          archive.append(pdfBuffer, {
            name: `Laporan Mingguan ${weeklyIds[idx]}.pdf`,
          });
        });

        // Judul
        doc.fontSize(16).text(`Laporan Mingguan ${weeklyIds[idx]}`, {
          align: "center",
        });
        doc.moveDown();

        // Header tabel
        const headers = [
          "No",
          "Tanggal Mulai",
          "Tanggal Selesai",
          "Divisi",
          "Lokasi",
          "Tipe Tugas",
          "Hari",
          "Deskripsi",
          "Area",
        ];
        doc.fontSize(12).text(headers.join(" | "));
        doc.moveDown(0.5);

        // Baris data
        flat.forEach((row: any) => {
          const line = [
            row.id,
            row.startAt,
            row.endAt,
            row.division,
            row.location,
            row.taskType,
            row.day,
            row.description,
            row.area,
          ].join(" | ");
          doc.text(line);
        });

        doc.end();
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat export file");
  }
};
