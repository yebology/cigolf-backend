import { PrismaClient, type weekly_report } from "@prisma/client";
import { parse, addDays } from "date-fns";
import PDFDocument from "pdfkit";
import { parse as parseCsv } from "csv-parse/sync";
import PDFTable from "pdfkit-table";

const prisma = new PrismaClient();

export const isValidDay = (day: String) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days.includes(day.toLowerCase());
};

const getDayName = (dateStr: string) => {
  const DAYS_ID = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00Z");
  const utc7Time = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return DAYS_ID[utc7Time.getUTCDay()];
};

export const parseDate = (input: string) => {
  const [day, month, year] = input.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
};

export const convertToISO = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};

export const formatDateUTC7 = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00Z");
  const utc7Time = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  const dd = String(utc7Time.getUTCDate()).padStart(2, "0");
  const mm = String(utc7Time.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = utc7Time.getUTCFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

export const filterWeeklyPlanAttributes = (histories: weekly_report[]) => {
  return histories.map((history: weekly_report) => ({
    id: history.id,
    startAt: new Date(history.start_date).toISOString().split("T")[0],
    endAt: new Date(history.end_date).toISOString().split("T")[0],
  }));
};

export const formatDateFromDay = (
  startAt: string,
  endAt: string,
  day: string
) => {
  if (!day) {
    return null;
  }

  const daysMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const start = parse(startAt, "dd-MM-yyyy", new Date());
  const end = parse(endAt, "dd-MM-yyyy", new Date());

  let targetDay = daysMap[day.toLowerCase()];
  if (targetDay == undefined) {
    throw new Error("");
  }

  for (let i = 0; i < 7; i++) {
    let candidate = addDays(start, i);
    if (candidate.getDay() === targetDay && candidate <= end) {
      return candidate;
    }
  }

  return;
};

export const getWeeklyReportWithDetails = async (id: number) => {
  return await prisma.weekly_report.findUnique({
    where: { id },
    include: {
      bridge_weekrep_weekdet: {
        include: {
          weekly_detail: {
            include: {
              division: true,
              location: true,
            },
          },
        },
      },
    },
  });
};

export const extractTasks = (report: any) => {
  return report.bridge_weekrep_weekdet.map((b: any) => b.weekly_detail);
};

export const groupTasksByDivisionAndLocation = (tasks: any[]) => {
  const divisionsMap = new Map();

  for (const task of tasks) {
    const divId = task!.division.id;
    const locId = task!.location.id;

    if (!divisionsMap.has(divId)) {
      divisionsMap.set(divId, {
        id: task!.division.id,
        name: task!.division.division,
        locations: new Map(),
      });
    }

    const division = divisionsMap.get(divId);

    if (!division.locations.has(locId)) {
      division.locations.set(locId, {
        locationId: task!.location.id,
        location: task!.location.location,
        tasks: [],
      });
    }

    const location = division.locations.get(locId);

    location.tasks.push({
      id: task!.id,
      taskType: task!.title_task,
      day: task!.start_date
        ? task!.start_date.toISOString().slice(0, 10)
        : null,
      description: task!.detail,
      area: task!.hole ? task!.hole.split(",").map((h: any) => h.trim()) : [],
    });
  }

  return Array.from(divisionsMap.values()).map((div) => ({
    ...div,
    locations: Array.from(div.locations.values()),
  }));
};

export const formatWeeklyReport = (report: any, divisions: any[]) => {
  return {
    id: report.id,
    startAt: report.start_date.toISOString().split("T")[0],
    endAt: report.end_date.toISOString().split("T")[0],
    createAt: report.created_at!.toISOString().split("T")[0],
    divisions,
  };
};

export function flattenReport(report: any) {
  const rows: any[] = [];
  let counter = 1;

  report.divisions.forEach((division: any) => {
    division.locations.forEach((location: any) => {
      location.tasks.forEach((task: any) => {
        rows.push({
          id: counter++,
          startAt: formatDateUTC7(report.startAt),
          endAt: formatDateUTC7(report.endAt),
          createAt: formatDateUTC7(report.createAt),
          division: division.name,
          location: location.location,
          taskType: task.taskType,
          day: task.day ? getDayName(task.day) : "",
          description: task.description,
          area: Array.isArray(task.area) ? task.area.join(", ") : task.area,
        });
      });
    });
  });

  return rows;
}

export async function generatePdfFromCsv(
  csv: string,
  weeklyId: number
): Promise<Buffer> {
  return new Promise(async (resolve) => {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(16).text(`Laporan Mingguan ${weeklyId}`, { align: "center" });
    doc.moveDown();

    // Parse CSV
    const records = parseCsv(csv, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
    });

    if (records.length === 0) {
      doc.text("Tidak ada data.");
      doc.end();
      return;
    }

    // Buat header dan data
    const headers = Object.keys(records[0]!).map((h) => ({
      label: h,
      property: h,
      width: 100,
    }));

    const datas = records.map((row: any) => ({ ...row }));

    console.log("headers:", headers);
    console.log("datas:", datas);

    // ⬇️ hanya sekali panggil
    await (doc as any).table(
      { headers, datas },
      {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(9),
      }
    );

    // Tutup dokumen setelah table selesai
    doc.end();
  });
}
