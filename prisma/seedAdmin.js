import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const DOCTOR_PASSWORD = await bcrypt.hash("Doctor@1234", 10);

  // ═══════════════════════════════════════
  // ADMIN USER
  // ═══════════════════════════════════════
  console.log("Seeding admin user...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@rachina.com" },
  });

  if (existingAdmin) {
    console.log("  Admin already exists, skipping...");
  } else {
    const hashedPassword = await bcrypt.hash("Admin@1234", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@rachina.com",
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
    });
    console.log("  Admin created ✓");
  }

  // ═══════════════════════════════════════
  // DOCTORS — Doctor profile + User account
  // ═══════════════════════════════════════
  console.log("\nSeeding doctors...");

  const doctors = [
    {
      name: "Dr. Sushila Thapa",
      specialization: "Gynecology & Obstetrics",
      qualification: "MBBS, MD (Gynecology), TU Institute of Medicine",
      experience: 14,
      hospital: "Tribhuvan University Teaching Hospital",
      location: "Maharajgunj, Kathmandu",
      phone: "9841123456",
      email: "sushila.thapa@tuth.edu.np",
      bio: "Senior gynecologist with over 14 years of experience specializing in PCOS, hormonal disorders, and reproductive health.",
      imageUrl: null,
      availableDays: ["Monday", "Wednesday", "Friday"],
      timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      consultFee: 1500,
      isActive: true,
    },
    {
      name: "Dr. Ramesh Adhikari",
      specialization: "Endocrinology",
      qualification: "MBBS, MD (Internal Medicine), DM (Endocrinology), BPKIHS",
      experience: 11,
      hospital: "Bir Hospital",
      location: "Mahaboudha, Kathmandu",
      phone: "9851234567",
      email: "ramesh.adhikari@birhospital.gov.np",
      bio: "Leading endocrinologist specializing in insulin resistance, thyroid disorders, and PCOS-related metabolic issues.",
      imageUrl: null,
      availableDays: ["Tuesday", "Thursday", "Saturday"],
      timeSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"],
      consultFee: 2000,
      isActive: true,
    },
    {
      name: "Dr. Anita Sharma",
      specialization: "Reproductive Medicine & Infertility",
      qualification:
        "MBBS, MS (Gynecology), Fellowship in Reproductive Medicine",
      experience: 9,
      hospital: "Nepal Medical College Teaching Hospital",
      location: "Jorpati, Kathmandu",
      phone: "9861345678",
      email: "anita.sharma@nmcth.edu.np",
      bio: "Reproductive medicine specialist with a focus on PCOS-related infertility and ovulation induction.",
      imageUrl: null,
      availableDays: ["Monday", "Tuesday", "Thursday"],
      timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM"],
      consultFee: 1800,
      isActive: true,
    },
    {
      name: "Dr. Prakash Gurung",
      specialization: "Dermatology",
      qualification: "MBBS, MD (Dermatology), Kathmandu Medical College",
      experience: 7,
      hospital: "Kathmandu Medical College Teaching Hospital",
      location: "Sinamangal, Kathmandu",
      phone: "9841987654",
      email: "prakash.gurung@kmc.edu.np",
      bio: "Dermatologist specializing in PCOS-related skin manifestations including hirsutism, acne, and acanthosis nigricans.",
      imageUrl: null,
      availableDays: ["Wednesday", "Friday", "Saturday"],
      timeSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      consultFee: 1200,
      isActive: true,
    },
    {
      name: "Dr. Mina Rai",
      specialization: "Nutrition & Dietetics",
      qualification:
        "MBBS, MSc (Clinical Nutrition), Certified PCOS Nutritionist",
      experience: 6,
      hospital: "HAMS Hospital",
      location: "Dhumbarahi, Kathmandu",
      phone: "9851456789",
      email: "mina.rai@hamshospital.com.np",
      bio: "Clinical nutritionist with specialized training in PCOS dietary management using Nepali dietary culture.",
      imageUrl: null,
      availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
      timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM"],
      consultFee: 1000,
      isActive: true,
    },
  ];

  for (const doctor of doctors) {
    // 1 — Create or skip Doctor profile
    let doctorRecord = await prisma.doctor.findUnique({
      where: { email: doctor.email },
    });

    if (doctorRecord) {
      console.log(`  Skipping Doctor profile for ${doctor.name} (exists)`);
    } else {
      doctorRecord = await prisma.doctor.create({ data: doctor });
      console.log(`  Doctor profile: ${doctor.name} ✓`);
    }

    // 2 — Create or skip User account for dashboard login
    const existingUser = await prisma.user.findUnique({
      where: { email: doctor.email },
    });

    if (existingUser) {
      console.log(`  Skipping User account for ${doctor.name} (exists)`);
    } else {
      await prisma.user.create({
        data: {
          name: doctor.name,
          email: doctor.email,
          password: DOCTOR_PASSWORD,
          role: "DOCTOR",
          isVerified: true,
        },
      });
      console.log(`  User account: ${doctor.name} ✓`);
    }
  }

  // ═══════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════
  console.log("\n─────────────────────────────────────────");
  console.log("ADMIN");
  console.log("  Email   : admin@rachina.com");
  console.log("  Password: Admin@1234");
  console.log("\nDOCTORS (all share the same password)");
  doctors.forEach((d) => console.log(`  ${d.email}`));
  console.log("  Password: Doctor@1234");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
