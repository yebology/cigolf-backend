import { Request, Response } from "express";
import { DailyPlanService } from "./daily.plan.service";
import archiver from "archiver";
import { stringify } from "csv-stringify/sync";
import { flattenReport } from "./daily-plan.helper";

const service = new DailyPlanService();

export const getDailyTaskPlan = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const result = await service.dailyTaskPlan(
      Number(foreman_id),
      Number(task_id)
    );
    res.json({
      status: "success",
      message: "Fetch data success.",
      data: result,
    });
  } catch (error) {
    res
      .status(404)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getDivisionDailyTaskPlanByDay = async (
  req: Request,
  res: Response
) => {
  try {
    const { foreman_id } = req.params;
    const result = await service.divisionDailyTaskPlanByDay(Number(foreman_id));
    res.json({
      status: "success",
      message: "Fetch data success.",
      data: result,
    });
  } catch (error) {
    res
      .status(404)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const getAllDivisionDailyPlan = async (req: Request, res: Response) => {
  try {
    const { foreman_id } = req.params;
    const { start_at, end_at } = req.query;

    let result;
    if (start_at && end_at) {
      result = await service.filteredAllDivisionDailyPlan(
        Number(foreman_id),
        start_at.toString(),
        end_at.toString()
      );
    } else if (!start_at && !end_at) {
      result = await service.allDivisionDailyPlan(Number(foreman_id));
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "invalid params" });
    }

    return res.json({
      status: "success",
      message: "retrieve all of the last 7 day plans",
      data: result,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ status: "error", message: (error as Error).message });
  }
};

export const createNewDivisionDailyPlan = async (
  req: Request,
  res: Response
) => {
  try {
    const { foreman_id } = req.params;
    await service.newDivisionDailyPlan(Number(foreman_id), req);
    res.json({
      status: "success",
      message: "Division Daily plan successfully created",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        fields: [{ priority: (error as Error).message }],
      },
    });
  }
};

export const approveForemanTodayTasks = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const { spvId } = req.body;
    await service.approveForemanTodayTasks(
      Number(foreman_id),
      Number(task_id),
      Number(spvId)
    );
    res.json({
      status: "success",
      message: "The task successfully approved.",
    });
  } catch (error) {
    res
      .status((error as Error).message === "The Task not found." ? 404 : 304)
      .json({
        status: "error",
        message: (error as Error).message,
      });
  }
};

export const addForemanTask = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const { divisionId, locationId, jobType, area, priority, description } =
      req.body;

    await service.addForemanTask(
      Number(foreman_id),
      Number(task_id),
      Number(divisionId),
      Number(locationId),
      jobType,
      area as string[],
      Number(priority),
      description
    );
    res.json({
      status: "success",
      message: "A new task for daily task has been added successfully",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        priority: [(error as Error).message],
      },
    });
  }
};

export const selfAddForemanTask = async (req: Request, res: Response) => {
  try {
    const { foreman_id, task_id } = req.params;
    const {
      divisionId,
      locationId,
      jobType,
      area,
      priority,
      description,
      workerNeeded,
      workerAvailable,
      workerNameList,
    } = req.body;

    await service.addForemanTask(
      Number(foreman_id),
      Number(task_id),
      Number(divisionId),
      Number(locationId),
      jobType,
      area as string[],
      Number(priority),
      description,
      workerNeeded,
      workerAvailable,
      workerNameList
    );
    res.json({
      status: "success",
      message: "A new task for daily task has been added successfully",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        priority: [(error as Error).message],
      },
    });
  }
};

export const updateForemanTask = async (req: Request, res: Response) => {
  try {
    const { foreman_id, daily_report_id, task_id } = req.params;
    const { locationId, area, workerNeeded, availableWorker, workerNameList } =
      req.body;

    await service.updateForemanTask(
      Number(foreman_id),
      Number(daily_report_id),
      Number(task_id),
      locationId,
      area,
      workerNeeded,
      availableWorker,
      workerNameList,
      req.file
    );
    res.json({
      status: "success",
      message: "a new task for daily task has been updated successfully",
    });
  } catch (error) {
    res.status(422).json({
      status: "error",
      message: "The given data was invalid.",
      errors: {
        area: [(error as Error).message],
      },
    });
  }
};

export const exportFile = async (req: Request, res: Response) => {
  try {
    const { type, daily_ids } = req.query;
    const { foreman_id } = req.params;

    let dailyIds: number[] = [];
    if (typeof daily_ids === "string") {
      try {
        dailyIds = JSON.parse(daily_ids);
      } catch (e) {
        throw new Error("invalid json weekly ids");
      }
    }

    if (String(type) != "csv" && String(type) != "pdf") {
      throw new Error("invalid type");
    }

    const allReports = await service.exportFile(Number(foreman_id), dailyIds);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=daily_reports.zip"
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (let idx = 0; idx < allReports!.length; idx++) {
      const report = allReports![idx];
      const flat = flattenReport(report);

      const metadataLines = [
        `Mandor,${report?.foremanName ?? ""}`,
        `Tanggal,${report?.createdAt ?? ""}`,
        `Status,${report?.approved?.isApproved ? "Sudah di approve" : "Belum di approve"}`,
      ];

      if (report?.approved?.isApproved) {
        metadataLines.push(
          `Tanggal Approve,${report?.approved?.approvedAt ?? ""}`,
          `Supervisor,${report?.approved?.spvName ?? ""}`
        );
      }

      const csvMeta = metadataLines.join("\n");

      const csv = stringify(flat, {
        header: true,
        columns: {
          id: "No",
          taskType: "Jenis Pekerjaan",
          description: "Detail Pekerjaan",
          division: "Divisi",
          location: "Lokasi",
          priority: "Prioritas",
          area: "Area",
          needWorker: "Jumlah Pekerja yang Diperlukan",
          availableWorker: "Jumlah Pekerja yang Tersedia",
          workerList: "Nama Pekerja",
          isFinished: "Status Pekerjaan",
        },
        quoted: true,
      });

      const finalCsv = `${csvMeta}\n${csv}`;

      if (type === "csv") {
        archive.append(finalCsv, {
          name: `Laporan Harian ${report.date} (${report.id}).csv`,
        });
      } else if (type === "pdf") {
        // const pdfBuffer = await generatePdfFromCsv(csv, weeklyIds[idx]);
        // archive.append(pdfBuffer, {
        //   name: `Laporan Mingguan ${weeklyIds[idx]}.pdf`,
        // });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat export file");
  }
};
