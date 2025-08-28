import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import { addDays, addWeeks, isWithinInterval, isSameDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding...')

    enum prioritas {
        P1,
        P2,
        P3,
        P4,
        P5
    }

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
                nama: faker.person.fullName(),
                email: faker.internet.email(),
                no_telp: faker.phone.number(),
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
                nama: faker.person.fullName(),
                email: faker.internet.email(),
                no_telp: faker.phone.number(),
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
                nama: faker.person.fullName(),
                email: faker.internet.email(),
                no_telp: faker.phone.number(),
                id_role: roleMap['Mandor'],
                is_active: true,
            },
        })
    }

    // -MARK: Regions
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

    // -MARK: Divisi
    await prisma.divisi.createMany({
        data: [
            { divisi: 'Operasional' },
            { divisi: 'Landscape' },
            { divisi: 'Projek' },
            { divisi: 'Irigasi' },
            { divisi: 'Mekanik' },
        ],
        skipDuplicates: true,
    })

    // -MARK: Lokasi
    await prisma.lokasi.createMany({
        data: [
            { lokasi: 'All' },
            { lokasi: 'Green' },
            { lokasi: 'Tee Box' },
            { lokasi: 'Fairway' },
            { lokasi: 'Apron' },
            { lokasi: 'Rough' },
            { lokasi: 'Bunker' },
            { lokasi: 'Nursery' },
            { lokasi: 'Driving Range' },
            { lokasi: 'Maingate' },
            { lokasi: 'Putting 10' },
            { lokasi: 'Paving Room' },
            { lokasi: 'Resto' },
            { lokasi: 'Mekanik' },
            { lokasi: 'Irigasi' },
        ],
        skipDuplicates: true,
    })

    // -MARK: Laporan Harian
    const mandors = await prisma.mandor.findMany({
        select: { id: true, id_region: true }, // adjust column names if different
    });

    const startDate = new Date('2025-01-01');
    for (let i = 0; i < 30; i++) {
        const tanggal = addDays(startDate, i);
        const mandor = mandors[i % mandors.length]; // cycle through mandors

        await prisma.laporan_harian.create({
            data: {
                id_mandor: mandor.id,
                id_region: mandor.id_region,
                tanggal,
                is_approved: i < 20,
            },
        });
    }

    // -MARK: Laporan Mingguan
    const weeklyStart = new Date('2025-01-01');
    for (let i = 0; i < 3; i++) {
        const tanggal_mulai = addWeeks(weeklyStart, i);
        const tanggal_selesai = addWeeks(tanggal_mulai, 1);

        await prisma.laporan_mingguan.create({
            data: {
                title: `Laporan Mingguan ke-${i + 1}`,
                tanggal_mulai,
                tanggal_selesai,
            },
        });
    }

    // -MARK: Minggu Detail
    const divisioption = await prisma.divisi.findMany();
    const lokasioption = await prisma.lokasi.findMany();

    const lokasiOptions = [
        { lokasi: 'All', divisi: 'Landscape' },
        { lokasi: 'All', divisi: 'Projek' },
        { lokasi: 'Green', divisi: 'Operasional' },
        { lokasi: 'Tee Box', divisi: 'Operasional' },
        { lokasi: 'Fairway', divisi: 'Operasional' },
        { lokasi: 'Apron', divisi: 'Operasional' },
        { lokasi: 'Rough', divisi: 'Operasional' },
        { lokasi: 'Bunker', divisi: 'Operasional' },
        { lokasi: 'Nursery', divisi: 'Operasional' },
        { lokasi: 'Driving Range', divisi: 'Operasional' },
        { lokasi: 'Maingate', divisi: 'Operasional' },
        { lokasi: 'Putting 10', divisi: 'Operasional' },
        { lokasi: 'Paving Room', divisi: 'Operasional' },
        { lokasi: 'Resto', divisi: 'Operasional' },
        { lokasi: 'Mekanik', divisi: 'Mekanik' },
        { lokasi: 'Irigasi', divisi: 'Irigasi' },
    ];

    for (let i = 0; i < 50; i++) {
        const divisi = divisioption[i % divisioption.length];

        // 🔹 Find matching lokasi
        let lokasiCandidates = lokasiOptions.filter(l => l.divisi === divisi.divisi);

        // 🔹 Special case: Operasional has a 10% chance to use "All"
        if (divisi.divisi === "Operasional" && Math.random() < 0.1) {
            lokasiCandidates.push({ lokasi: "All", divisi: "Operasional" });
        }

        // Pick random lokasi from the candidates
        const lokasi = lokasiCandidates[Math.floor(Math.random() * lokasiCandidates.length)];

        const lapming = await prisma.laporan_mingguan.findFirst({
            orderBy: { id: "desc" },
        });

        let tanggal_mulai: Date | null = null;
        if (lapming && Math.random() > 0.2) {
            const randomDay = addDays(lapming.tanggal_mulai, Math.floor(Math.random() * 6));
            if (
                isWithinInterval(randomDay, {
                    start: lapming.tanggal_mulai,
                    end: lapming.tanggal_selesai,
                })
            ) {
                tanggal_mulai = randomDay;
            }
        }

        let hole: string | null = null;
        if (lokasi?.lokasi === "All" && Math.random() < 0.5) {
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

        await prisma.minggu_detail.create({
            data: {
                title: `Task ${i + 1} - ${divisi.divisi}`,
                id_divisi: divisi.id,
                id_lokasi:
                    lokasioption.find(l => l.lokasi === lokasi?.lokasi)?.id || lokasioption[0].id,
                prioritas: `P${(i % 5) + 1}` as any, // ensure it's typed correctly
                tanggal_mulai,
                hole,
                keterangan: `Keterangan untuk task ${i + 1}`,
                is_done: tanggal_mulai && Math.random() < 0.3 ? true : false,
            },
        });
    }

    // -MARK: Bridge Lapming Mingdet
    const lapmingList = await prisma.laporan_mingguan.findMany({
        orderBy: { tanggal_mulai: "asc" },
    });

    for (const lapming of lapmingList) {
        // Get all minggu_detail within the week
        const mingdetList = await prisma.minggu_detail.findMany({
            where: {
                tanggal_mulai: {
                    gte: lapming.tanggal_mulai,
                    lte: lapming.tanggal_selesai,
                },
            },
        });

        // Get unique divisi IDs
        const divisiSet = new Set(mingdetList.map(m => m.id_divisi));

        // Only create bridge if all 5 divisi are present
        if (divisiSet.size === 5) {
            for (const mingdet of mingdetList) {
                await prisma.bridge_lapming_mingdet.create({
                    data: {
                        id_lapming: lapming.id,
                        id_mingdet: mingdet.id,
                    },
                });
            }
        }
    }

    // -MARK: Harian Detail + Bridge Laphar Hardet
    const laporanHarian = await prisma.laporan_harian.findMany({
        orderBy: { id: 'asc' },
    });

    const mingguDetails = await prisma.minggu_detail.findMany();
    const divisi = await prisma.divisi.findMany();
    const lokasi = await prisma.lokasi.findMany();

    for (const lapHar of laporanHarian) {
        for (const div of divisi) {
            let taskCount = 0;
            switch (div.divisi) {
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
                // Find matching minggu_detail if tanggal_mulai matches
                const matchingMinggu = mingguDetails.filter(
                    md =>
                        md.id_divisi === div.id &&
                        md.tanggal_mulai &&
                        isSameDay(md.tanggal_mulai, lapHar.tanggal)
                );

                let mingguDetail;
                if (matchingMinggu.length > 0) {
                    mingguDetail = matchingMinggu[faker.number.int({ min: 0, max: matchingMinggu.length - 1 })];
                } else {
                    mingguDetail = null;
                }

                // Assign fields
                const title = mingguDetail?.title || `Task ${div.divisi} ${i + 1}`;
                const id_lokasi = mingguDetail?.id_lokasi || lokasi[faker.number.int({ min: 0, max: lokasi.length - 1 })].id;
                const prior = mingguDetail?.prioritas || prioritas[`P${faker.number.int({ min: 1, max: 5 })}`];
                let hole: string | null = null;

                if (mingguDetail?.hole) {
                    hole = mingguDetail.hole; // copy from minggu_detail if exists
                } else {
                    // 50% chance to have a hole
                    if (Math.random() < 0.5) {
                        if (div.divisi === "Operasional" || div.divisi === "Landscape" || div.divisi === "Projek") {
                            // generate random hole numbers 1-27, unordered
                            const numHoles = faker.number.int({ min: 1, max: 5 });
                            const holeNumbers: number[] = [];
                            while (holeNumbers.length < numHoles) {
                                const h = faker.number.int({ min: 1, max: 27 });
                                if (!holeNumbers.includes(h)) holeNumbers.push(h);
                            }
                            // randomize chipping
                            const chippingText = Math.random() < 0.5 ? " chipping" : "";
                            hole = holeNumbers.sort((a, b) => a - b).join(", ") + chippingText;

                            // occasionally use special places if divisi allows "All"
                            if (Math.random() < 0.1) {
                                const specialPlaces = ["Family Club", "Club House", "Teras"];
                                hole = specialPlaces[faker.number.int({ min: 0, max: specialPlaces.length - 1 })];
                            }
                        }
                    }
                }

                const keterangan = mingguDetail?.keterangan || faker.lorem.sentence();

                // tk_butuh / tk_tersedia / nama_tk
                let tk_butuh;
                let tk_tersedia;
                let nama_tk;
                if (hole) {
                    tk_butuh = faker.number.int({ min: 1, max: 5 });
                    tk_tersedia = faker.number.int({ min: 0, max: tk_butuh });
                    nama_tk = Array.from({ length: tk_tersedia }).map(() => faker.person.fullName()).join(', ');
                } else {
                    tk_butuh = null;
                    tk_tersedia = null;
                    nama_tk = null;
                }

                // Create harian_detail
                const harian = await prisma.harian_detail.create({
                    data: {
                        id_mingdet: mingguDetail?.id || null,
                        title,
                        id_lokasi,
                        id_divisi: div.id,
                        prioritas: prior,
                        hole,
                        tk_butuh,
                        tk_tersedia,
                        nama_tk,
                        keterangan,
                        url_foto: null,
                        is_done: false,
                    },
                });

                // Create bridge
                await prisma.bridge_laphar_hardet.create({
                    data: {
                        id_laphar: lapHar.id,
                        id_hardet: harian.id,
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
