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
                role_id: roleMap['Admin'],
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
                role_id: roleMap['Supervisor'],
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
                role_id: roleMap['Mandor'],
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

    // -MARK: foremans
    await prisma.foreman.createMany({
        data: [
            { region_id: 1, user_id: 6, company: faker.company.name() },
            { region_id: 2, user_id: 7, company: faker.company.name() },
            { region_id: 3, user_id: 8, company: faker.company.name() },
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
    const foremans = await prisma.foreman.findMany({
        select: { id: true, region_id: true }, // adjust column names if different
    });

    const startDate = new Date('2025-01-01');
    const users = await prisma.user.findMany({
        where: { role_id: 2 },
    });
    for (let i = 0; i < 30; i++) {
        const date = addDays(startDate, i);
        const foreman = foremans[i % foremans.length]; // cycle through foremans

        await prisma.daily_report.create({
            data: {
                foreman_id: foreman.id,
                region_id: foreman.region_id,
                date,
                is_approved: i < 20,
                approved_at: i < 20 ? addDays(date, 0) : null,
                approved_by: i < 20 ? users[i % users.length].name : null, 
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
    
    const weeklyReports = await prisma.weekly_report.findMany({
        orderBy: { id: "asc" },
    });

    for (let i = 0; i < 50; i++) {
        const division = divisionoption[i % divisionoption.length];

        let locationCandidates = locationOptions.filter(l => l.division === division.division);

        if (division.division === "Operasional" && Math.random() < 0.1) {
            locationCandidates.push({ location: "All", division: "Operasional" });
        }

        // Pick random location from the candidates
        const location = locationCandidates[Math.floor(Math.random() * locationCandidates.length)];

        const weekrep = weeklyReports[Math.floor(Math.random() * weeklyReports.length)];

        let start_date: Date | null = null;
        if (weekrep && Math.random() > 0.2) {
            const randomDay = addDays(weekrep.start_date, Math.floor(Math.random() * 6));
            if (
                isWithinInterval(randomDay, {
                    start: weekrep.start_date,
                    end: weekrep.end_date,
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
                division_id: division.id,
                location_id:
                    locationoption.find(l => l.location === location?.location)?.id || locationoption[0].id,
                start_date,
                hole,
                detail: `detail untuk task ${i + 1}`,
                is_done: start_date && Math.random() < 0.3 ? true : false,
            },
        });
    }

    //-MARK: - Bridge Weekly Detail
    const weeklyDetail = await prisma.weekly_detail.findMany({
        orderBy: { id: "asc" },
    });

    for (const weekrep of weeklyReports) {
        for (const div of divisionoption) {
            const validDetails = weeklyDetail.filter(d => {
                if (d.division_id !== div.id) return false;
                if (!d.start_date) return true;
                return isWithinInterval(d.start_date, {
                    start: weekrep.start_date,
                    end: weekrep.end_date,
                });
            });
            for (const detail of validDetails) {
                await prisma.bridge_weekrep_weekdet.create({
                    data: {
                        weekrep_id: weekrep.id,
                        weekdet_id: detail.id,
                    },
                });
            }
        }
    }


    // -MARK: Harian Detail + Bridge dailyrep Hardet
    const dailyReports = await prisma.daily_report.findMany({
        orderBy: { id: 'asc' },
    });

    const weeklyDetails = await prisma.weekly_detail.findMany();
    const division = await prisma.division.findMany();
    const location = await prisma.location.findMany();

    const usedweeklyDetailIds = new Set<number>();

    for (const dailyrep of dailyReports) {
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
                const matchingMinggu = weeklyDetails.filter(
                    md =>
                        md.division_id === div.id &&
                        md.start_date &&
                        isSameDay(md.start_date, dailyrep.date) &&
                        !usedweeklyDetailIds.has(md.id) // ✅ only unused ones
                );

                let weeklyDetail;
                if (matchingMinggu.length > 0) {
                    weeklyDetail =
                        matchingMinggu[faker.number.int({ min: 0, max: matchingMinggu.length - 1 })];
                    usedweeklyDetailIds.add(weeklyDetail.id); // ✅ mark as used
                } else {
                    weeklyDetail = null;
                }

                // Assign fields
                const title_task = weeklyDetail?.title_task || `Task ${div.division} ${i + 1}`;
                const location_id =
                    weeklyDetail?.location_id ||
                    location[faker.number.int({ min: 0, max: location.length - 1 })].id;

                const prior = priority[`P${faker.number.int({ min: 1, max: 5 })}` as keyof typeof priority];

                const hole = weeklyDetail?.hole || (Math.random() < 0.5 ? `Hole ${faker.number.int({ min: 1, max: 27 })}` : null);

                const detail = weeklyDetail?.detail || faker.lorem.sentence();

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

                const dailydet = await prisma.daily_detail.create({
                    data: {
                        weekdet_id: weeklyDetail?.id || null,
                        title_task,
                        location_id,
                        division_id: div.id,
                        priority: prior,
                        hole,
                        worker_need,
                        worker_avail,
                        worker_name,
                        detail,
                        url_photo: null,
                        is_done: weeklyDetail?.is_done ?? (Math.random() < 0.3)
                    },
                });

                await prisma.bridge_dailyrep_dailydet.create({
                    data: {
                        dailyrep_id: dailyrep.id,
                        dailydet_id: dailydet.id,
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
