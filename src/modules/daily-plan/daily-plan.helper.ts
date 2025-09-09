import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey // pakai service key di backend
);

export const isValidArea = (areas: string[]) => {
  const holes = Array.from({ length: 27 }, (_, i) => `Hole ${i + 1}`);

  const extraAreas = [
    "CH",
    "FC",
    "Villa",
    "Main Gate",
    "Driving Range",
    "Parkiran",
  ];

  const availableAreas = [...holes, ...extraAreas];

  for (const area of areas) {
    if (!availableAreas.includes(area)) {
      return false;
    }
  }

  return true;
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

export const formatDateRange = (dailyReports: any) => {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  let formatted: any = [];

  dailyReports.map((report: any) => {
    const dateObj = new Date(report.date);
    const day = dayNames[dateObj.getDay()];

    const dateFormatted = `${("0" + dateObj.getDate()).slice(-2)}-${("0" + (dateObj.getMonth() + 1)).slice(-2)}-${dateObj.getFullYear()}`;

    formatted.push({
      id: report.id,
      day,
      date: dateFormatted,
    });
  });

  return formatted;
};

export function flattenReport(report: any) {
  const rows: any[] = [];
  let counter = 1;

  report.divisions.forEach((division: any) => {
    division.locations.forEach((location: any) => {
      location.tasks.forEach((task: any) => {
        rows.push({
          id: counter++,
          taskType: task?.taskType,
          description: task?.description,
          division: division.name,
          location: location.locationName,
          priority: task?.priority,
          area: Array.isArray(task?.area)
            ? task.area.join(", ")
            : (task?.area ?? ""),
          needWorker: task?.needWorker,
          availableWorker: task?.availableWorker,
          workerList: Array.isArray(task?.workerList)
            ? task.workerList.join(", ")
            : (task?.workerList ?? ""),
          isFinished: task?.isFinished ? "Selesai" : "Belum Selesai",
        });
      });
    });
  });

  return rows;
}

export const uploadImage = async (image: Express.Multer.File) => {
  const fileName = `${Date.now()}_${image.originalname}`;

  const { data, error } = await supabase.storage
    .from("cigolf")
    .upload(fileName, image.buffer, {
      contentType: image.mimetype,
    });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from("cigolf")
    .getPublicUrl(fileName);

  return publicData.publicUrl;
};

export const convertToISO = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};

export const findForeman = async (foremanId: number) => {
  return await prisma.foreman.findFirst({
    where: {
      id: foremanId,
    },
    include: {
      users: true,
    },
  });
};

export const getDailyReport = async (foremanId: number, taskId?: number) => {
  if (taskId) {
    return await prisma.daily_report.findUnique({
      where: { id: taskId, foreman_id: foremanId },
      include: {
        bridge_dailyrep_dailydet: {
          include: {
            daily_detail: {
              include: { division: true, location: true },
            },
          },
        },
        users: true,
      },
    });
  }

  // latest report
  return await prisma.daily_report.findFirst({
    where: { foreman_id: foremanId },
    orderBy: {
      id: "desc",
    },
    take: 1,
    include: {
      bridge_dailyrep_dailydet: {
        include: {
          daily_detail: { include: { division: true, location: true } },
        },
      },
      users: true,
    },
  });
};

export const mapTasksToDivisions = (tasks: any[]) => {
  const divisionsMap = new Map();

  for (const task of tasks) {
    const divId = task?.division_id;
    const locId = task?.location_id;

    if (!divisionsMap.has(divId)) {
      divisionsMap.set(divId, {
        id: divId,
        name: task?.division.division,
        locations: new Map(),
      });
    }

    const division = divisionsMap.get(divId);

    if (!division.locations.has(locId)) {
      division.locations.set(locId, {
        locationId: locId,
        locationName: task?.location.location,
        tasks: [],
      });
    }

    const location = division.locations.get(locId);

    location.tasks.push({
      id: task?.id,
      taskType: task?.title_task,
      description: task?.detail,
      priority: task?.priority,
      area: task?.hole ? task.hole.split(",").map((h: any) => h.trim()) : [],
      needWorker: task?.worker_need,
      availableWorker: task?.worker_avail,
      workerList: task?.worker_name
        ? task.worker_name.split(",").map((h: any) => h.trim())
        : [],
      isFinished: task?.is_done,
      imageUrl: task?.url_photo,
    });
  }

  return Array.from(divisionsMap.values()).map((div) => ({
    ...div,
    locations: Array.from(div.locations.values()),
  }));
};

export const calculateTaskStats = (divisions: any[]) => {
  const totalTasks = divisions.reduce((divSum, div) => {
    return (
      divSum +
      div.locations.reduce((locSum: number, loc: any) => {
        return locSum + (loc.tasks.length || 0);
      }, 0)
    );
  }, 0);

  const finishedTasks = divisions.reduce((divSum, div) => {
    return (
      divSum +
      div.locations.reduce((locSum: number, loc: any) => {
        return (
          locSum +
          loc.tasks.filter((task: any) => task.isFinished === true).length
        );
      }, 0)
    );
  }, 0);

  return {
    totalTasks,
    finishedTasks,
    pendingTasks: totalTasks - finishedTasks,
  };
};
