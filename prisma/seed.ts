import { PrismaClient, priority } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { addDays, addWeeks, isWithinInterval, isSameDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding...')
    // - MARK: Roles
    await prisma.role.createMany({
        data: [
            { role: 'Admin' },
            { role: 'Supervisor' },
            { role: 'Mandor' },
        ],
        skipDuplicates: true,
    })

    // -MARK: Users
    const roles = await prisma.role.findMany()
    const roleMap: Record<string, number> = {}
    roles.forEach(r => (roleMap[r.role] = r.id))

    for (let i = 0; i < 2; i++) {
        await prisma.user.create({
            data: {
                username: faker.internet.username(),
                password_hash: await bcrypt.hash('password123', 10),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone_number: faker.phone.number(),
                id_role: roleMap['Admin'],
                is_active: true,
            },
        })
    }

    for (let i = 0; i < 3; i++) {
        await prisma.user.create({
            data: {
                username: faker.internet.username(),
                password_hash: await bcrypt.hash('password123', 10),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone_number: faker.phone.number(),
                id_role: roleMap['Supervisor'],
                is_active: true,
            },
        })
    }

    for (let i = 0; i < 3; i++) {
        await prisma.user.create({
            data: {
                username: faker.internet.username(),
                password_hash: await bcrypt.hash('password123', 10),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone_number: faker.phone.number(),
                id_role: roleMap['Mandor'],
                is_active: true,
            },
        })
    }

    // -MARK: regions
    await prisma.region.createMany({
        data: [
            { region: 'Lembah' },
            { region: 'Danau' },
            { region: 'Gunung' },
        ],
        skipDuplicates: true,
    })

    // -MARK: Mandors
    await prisma.mandor.createMany({
        data: [
            { id_region: 1, id_user: 6 },
            { id_region: 2, id_user: 7 },
            { id_region: 3, id_user: 8 },
        ],
        skipDuplicates: true,
    })

    // -MARK: division
    await prisma.division.createMany({
        data: [
            { division: 'Operasional' },
            { division: 'Landscape' },
            { division: 'Projek' },
            { division: 'Irigasi' },
            { division: 'Mekanik' },
        ],
        skipDuplicates: true,
    })

    // -MARK: location
    await prisma.location.createMany({
        data: [
            { location: 'All' },
            { location: 'Green' },
            { location: 'Tee Box' },
            { location: 'Fairway' },
            { location: 'Apron' },
            { location: 'Rough' },
            { location: 'Bunker' },
            { location: 'Nursery' },
            { location: 'Driving Range' },
            { location: 'Maingate' },
            { location: 'Putting 10' },
            { location: 'Paving Room' },
            { location: 'Resto' },
            { location: 'Mekanik' },
            { location: 'Irigasi' },
        ],
        skipDuplicates: true,
    })

    // -MARK: Laporan Harian
    const mandors = await prisma.mandor.findMany({
        select: { id: true, id_region: true }, // adjust column names if different
    });

    const startDate = new Date('2025-01-01');
    for (let i = 0; i < 30; i++) {
        const date = addDays(startDate, i);
        const mandor = mandors[i % mandors.length]; // cycle through mandors

        await prisma.daily_report.create({
            data: {
                id_mandor: mandor.id,
                id_region: mandor.id_region,
                date,
                is_approved: i < 20,
            },
        });
    }

    // -MARK: Laporan Mingguan
    const weeklyStart = new Date('2025-01-01');
    for (let i = 0; i < 3; i++) {
        const start_date = addWeeks(weeklyStart, i);
        const end_date = addWeeks(start_date, 1);

        await prisma.weekly_report.create({
            data: {
                start_date,
                end_date
            },
        });
    }

    // -MARK: Minggu Detail
    const divisionoption = await prisma.division.findMany();
    const locationoption = await prisma.location.findMany();

    const locationOptions = [
        { location: 'All', division: 'Landscape' },
        { location: 'All', division: 'Projek' },
        { location: 'Green', division: 'Operasional' },
        { location: 'Tee Box', division: 'Operasional' },
        { location: 'Fairway', division: 'Operasional' },
        { location: 'Apron', division: 'Operasional' },
        { location: 'Rough', division: 'Operasional' },
        { location: 'Bunker', division: 'Operasional' },
        { location: 'Nursery', division: 'Operasional' },
        { location: 'Driving Range', division: 'Operasional' },
        { location: 'Maingate', division: 'Operasional' },
        { location: 'Putting 10', division: 'Operasional' },
        { location: 'Paving Room', division: 'Operasional' },
        { location: 'Resto', division: 'Operasional' },
        { location: 'Mekanik', division: 'Mekanik' },
        { location: 'Irigasi', division: 'Irigasi' },
    ];

    for (let i = 0; i < 50; i++) {
        const division = divisionoption[i % divisionoption.length];

        // 🔹 Find matching location
        let locationCandidates = locationOptions.filter(l => l.division === division.division);

        // 🔹 Special case: Operasional has a 10% chance to use "All"
        if (division.division === "Operasional" && Math.random() < 0.1) {
            locationCandidates.push({ location: "All", division: "Operasional" });
        }

        // Pick random location from the candidates
        const location = locationCandidates[Math.floor(Math.random() * locationCandidates.length)];

        const lapming = await prisma.weekly_report.findFirst({
            orderBy: { id: "asc" },
        });

        let start_date: Date | null = null;
        if (lapming && Math.random() > 0.2) {
            const randomDay = addDays(lapming.start_date, Math.floor(Math.random() * 6));
            if (
                isWithinInterval(randomDay, {
                    start: lapming.start_date,
                    end: lapming.end_date,
                })
            ) {
                start_date = randomDay;
            }
        }

        let hole: string | null = null;
        if (location?.location === "All" && Math.random() < 0.5) {
            const places = ["Family Club - Lembah", "Family Club - Gunung", "Family Club - Danau", "Club House - Lembah", "Club House - Gunung", "Club House - Danau", "Teras - Lembah", "Teras - Gunung", "Teras - Danau"];
            hole = places[Math.floor(Math.random() * places.length)];
        } else if (Math.random() < 0.5) {
            const mode = Math.random() < 0.5 ? "range" : "list";

            let holeStr: string;

            if (mode === "range") {
                // pick random start and end (1–27)
                const start = Math.floor(Math.random() * 27) + 1;
                const end = Math.min(27, start + Math.floor(Math.random() * 5) + 1);
                holeStr = `${start}-${end}`;
            } else {
                // pick random unique holes (up to 5 numbers)
                const count = Math.floor(Math.random() * 5) + 1;
                const holes = new Set<number>();
                while (holes.size < count) {
                    holes.add(Math.floor(Math.random() * 27) + 1);
                }
                holeStr = [...holes].sort((a, b) => a - b).join(",");
            }

            // ~20% chance to add " chipping"
            if (Math.random() < 0.2) {
                holeStr += " chipping";
            }

            hole = holeStr;
        }

        await prisma.weekly_detail.create({
            data: {
                title_task: `Task ${i + 1} - ${division.division}`,
                id_division: division.id,
                id_location:
                    locationoption.find(l => l.location === location?.location)?.id || locationoption[0].id,
                priority: priority[`P${faker.number.int({ min: 1, max: 5 })}` as keyof typeof priority], // ensure it's typed correctly
                start_date,
                hole,
                detail: `detail untuk task ${i + 1}`,
                is_done: start_date && Math.random() < 0.3 ? true : false,
            },
        });
    }

    const laporanMingguans = await prisma.weekly_report.findMany();
    const mingguDetail = await prisma.weekly_detail.findMany(); // contains division info

    // Group mingguDetail by division
    const groupedBydivision = mingguDetail.reduce((acc, detail) => {
        if (!acc[detail.id_division]) acc[detail.id_division] = [];
        acc[detail.id_division].push(detail);
        return acc;
    }, {} as Record<string, typeof mingguDetails>);

    for (const lapming of laporanMingguans) {
        // Ensure at least one weekly_detail per division
        for (const division in groupedBydivision) {
            const randomDetail =
                groupedBydivision[division][
                Math.floor(Math.random() * groupedBydivision[division].length)
                ];

            await prisma.bridge_weekrep_weekdet.create({
                data: {
                    id_weekrep: lapming.id,
                    id_weekdet: randomDetail.id,
                },
            });
        }
    }

    // -MARK: Harian Detail + Bridge Laphar Hardet
    const laporanHarian = await prisma.daily_report.findMany({
        orderBy: { id: 'asc' },
    });

    const mingguDetails = await prisma.weekly_detail.findMany();
    const division = await prisma.division.findMany();
    const location = await prisma.location.findMany();

    const usedMingguDetailIds = new Set<number>();

    for (const lapHar of laporanHarian) {
        for (const div of division) {
            let taskCount = 0;
            switch (div.division) {
                case 'Operasional':
                    taskCount = faker.number.int({ min: 12, max: 16 });
                    break;
                case 'Landscape':
                    taskCount = faker.number.int({ min: 13, max: 16 });
                    break;
                case 'Projek':
                    taskCount = faker.number.int({ min: 6, max: 7 });
                    break;
                case 'Irigasi':
                    taskCount = faker.number.int({ min: 4, max: 7 });
                    break;
                case 'Mekanik':
                    taskCount = faker.number.int({ min: 1, max: 2 });
                    break;
            }

            for (let i = 0; i < taskCount; i++) {
                // Find available weekly_detail that matches
                const matchingMinggu = mingguDetails.filter(
                    md =>
                        md.id_division === div.id &&
                        md.start_date &&
                        isSameDay(md.start_date, lapHar.date) &&
                        !usedMingguDetailIds.has(md.id) // ✅ only unused ones
                );

                let mingguDetail;
                if (matchingMinggu.length > 0) {
                    mingguDetail =
                        matchingMinggu[faker.number.int({ min: 0, max: matchingMinggu.length - 1 })];
                    usedMingguDetailIds.add(mingguDetail.id); // ✅ mark as used
                } else {
                    mingguDetail = null;
                }

                // Assign fields
                const title_task = mingguDetail?.title_task || `Task ${div.division} ${i + 1}`;
                const id_location =
                    mingguDetail?.id_location ||
                    location[faker.number.int({ min: 0, max: location.length - 1 })].id;

                const prior =
                    mingguDetail?.priority ??
                    priority[`P${faker.number.int({ min: 1, max: 5 })}` as keyof typeof priority];

                const hole = mingguDetail?.hole || (Math.random() < 0.5 ? `Hole ${faker.number.int({ min: 1, max: 27 })}` : null);

                const detail = mingguDetail?.detail || faker.lorem.sentence();

                // tk_butuh / tk_tersedia / nama_tk
                let worker_need;
                let worker_avail;
                let worker_name;
                if (hole) {
                    worker_need = faker.number.int({ min: 1, max: 5 });
                    worker_avail = faker.number.int({ min: 0, max: worker_need });
                    worker_name = Array.from({ length: worker_avail })
                        .map(() => faker.person.fullName())
                        .join(', ');
                } else {
                    worker_need = null;
                    worker_avail = null;
                    worker_name = null;
                }

                const harian = await prisma.daily_detail.create({
                    data: {
                        id_weekdet: mingguDetail?.id || null,
                        title_task,
                        id_location,
                        id_division: div.id,
                        priority: prior,
                        hole,
                        worker_need,
                        worker_avail,
                        worker_name,
                        detail,
                        url_photo: null,
                        is_done: mingguDetail?.is_done ?? (Math.random() < 0.3)
                    },
                });

                await prisma.bridge_dailyrep_dailydet.create({
                    data: {
                        id_dailyrep: lapHar.id,
                        id_dailydet: harian.id,
                    },
                });
            }
        }
    }

    console.log('✅ Seeding done!')
}

main()
    .then(async () => {
        console.log('✅ Seeding finished!')
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Error while seeding:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
