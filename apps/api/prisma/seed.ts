import { PrismaClient, Category, Severity, Status } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed script: creates 5 demo users + 10 sample posts across different Dhaka
 * wards and categories, mirroring the frontend mock data.
 */
async function main() {
  console.log("🌱 Seeding UpAware database...\n");

  // ── Users ──
  const passwordHash = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "ayesha@example.com" },
      update: {},
      create: {
        name: "Ayesha Rahman",
        email: "ayesha@example.com",
        passwordHash,
        ward: 33,
        isVolunteer: true,
        points: 245,
      },
    }),
    prisma.user.upsert({
      where: { email: "rashed@example.com" },
      update: {},
      create: {
        name: "Rashed Khan",
        email: "rashed@example.com",
        passwordHash,
        ward: 4,
        points: 120,
      },
    }),
    prisma.user.upsert({
      where: { email: "nadia@example.com" },
      update: {},
      create: {
        name: "Nadia Islam",
        email: "nadia@example.com",
        passwordHash,
        ward: 18,
        isVolunteer: true,
        points: 89,
      },
    }),
    prisma.user.upsert({
      where: { email: "tariq@example.com" },
      update: {},
      create: {
        name: "Tariq Aziz",
        email: "tariq@example.com",
        passwordHash,
        ward: 19,
        points: 56,
      },
    }),
    prisma.user.upsert({
      where: { email: "farhana@example.com" },
      update: {},
      create: {
        name: "Farhana Yasmin",
        email: "farhana@example.com",
        passwordHash,
        ward: 47,
        points: 178,
      },
    }),
  ]);

  console.log(`  ✓ ${users.length} users seeded`);

  // ── Posts ──
  const posts = [
    {
      title: "Severe waterlogging on Mirpur Road after last night's rain",
      body: "The road in front of Kazipara metro station is completely submerged. Rickshaws are overturning and commuters are stranded. This has been recurring every monsoon for 3 years. DSCC needs to clear the drains urgently.",
      category: Category.INFRASTRUCTURE,
      severity: Severity.EMERGENCY,
      status: Status.OPEN,
      lat: 23.8068,
      lng: 90.3686,
      address: "Mirpur Road, Kazipara",
      ward: 4,
      mediaUrls: [
        "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      ],
      aiAllowed: true,
      upvoteCount: 142,
      authorId: users[1].id,
    },
    {
      title: "Broken streetlight junction — unsafe at night",
      body: "The streetlight at the Gulshan 2 circle junction has been out for two weeks. Pedestrians crossing at night are at risk, especially with the recent mugging reports nearby.",
      category: Category.SAFETY,
      severity: Severity.NORMAL,
      status: Status.IN_PROGRESS,
      lat: 23.7925,
      lng: 90.4078,
      address: "Gulshan Circle 2",
      ward: 18,
      mediaUrls: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      ],
      aiAllowed: true,
      upvoteCount: 67,
      authorId: users[2].id,
    },
    {
      title: "Potholes damaging vehicles on Banani 11 road",
      body: "Multiple deep potholes have formed between road 11 and road 79. Several bikes have skidded. Needs urgent filling before the rains worsen it.",
      category: Category.INFRASTRUCTURE,
      severity: Severity.NORMAL,
      status: Status.OPEN,
      lat: 23.7937,
      lng: 90.4066,
      address: "Banani Road 11",
      ward: 19,
      mediaUrls: [
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      ],
      upvoteCount: 38,
      authorId: users[3].id,
    },
    {
      title: "Garbage piling up near Dhanmondi Lake — mosquito hazard",
      body: "Uncollected waste near the lake behind Rabindra Sarobar is rotting and breeding mosquitoes. Dengue risk is high this season. DSCC conservancy hasn't visited in over a week.",
      category: Category.ENVIRONMENT,
      severity: Severity.NORMAL,
      status: Status.OPEN,
      lat: 23.7466,
      lng: 90.376,
      address: "Dhanmondi Lake, Road 8A",
      ward: 47,
      mediaUrls: [
        "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      ],
      aiAllowed: true,
      upvoteCount: 89,
      authorId: users[4].id,
    },
    {
      title: "Snatching incident reported near Bashundhara gate",
      body: "Two youths on a motorcycle snatched a phone from a passerby near the main gate at 9pm. Sharing so neighbours stay alert. Please avoid walking alone here after dark.",
      category: Category.CRIME,
      severity: Severity.EMERGENCY,
      status: Status.OPEN,
      lat: 23.8133,
      lng: 90.4259,
      address: "Bashundhara Main Gate",
      ward: 7,
      isAnon: true,
      mediaUrls: [],
      upvoteCount: 211,
      authorId: users[0].id,
    },
    {
      title: "Traffic signal at Mohakhali not working",
      body: "The signal at Mohakhali intersection has been stuck/off for 3 days. Traffic police are manually managing it during peak hours but jams stretch to Kawran Bazar.",
      category: Category.TRAFFIC,
      severity: Severity.NORMAL,
      status: Status.RESOLVED,
      lat: 23.7785,
      lng: 90.4034,
      address: "Mohakhali Intersection",
      ward: 23,
      mediaUrls: [
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
      ],
      upvoteCount: 54,
      authorId: users[1].id,
    },
    {
      title: "Overflowing manhole near Baily Road market",
      body: "A manhole cover near the Baily Road kitchen market is overflowing with sewage. Foul smell and health hazard for shoppers and vendors. WASA needs to attend immediately.",
      category: Category.HEALTH,
      severity: Severity.NORMAL,
      status: Status.IN_PROGRESS,
      lat: 23.7366,
      lng: 90.4127,
      address: "Baily Road, Naya Paltan",
      ward: 33,
      mediaUrls: [],
      aiAllowed: true,
      upvoteCount: 72,
      authorId: users[1].id,
    },
    {
      title: "Illegal parking blocking Mirpur 10 ambulance access",
      body: "Cars parked illegally on both sides near Mirpur 10 roundabout are blocking the route to the local clinic. An ambulance was delayed 15 minutes yesterday.",
      category: Category.TRAFFIC,
      severity: Severity.NORMAL,
      status: Status.OPEN,
      lat: 23.8068,
      lng: 90.3686,
      address: "Mirpur 10 Roundabout",
      ward: 4,
      mediaUrls: [],
      upvoteCount: 45,
      authorId: users[2].id,
    },
    {
      title: "Construction debris dumped on Mohammadpur footpath",
      body: "A large pile of bricks and concrete from nearby construction is blocking the entire footpath, forcing pedestrians onto the road. Reported multiple times, no action.",
      category: Category.ENVIRONMENT,
      severity: Severity.NORMAL,
      status: Status.RESOLVED,
      lat: 23.7706,
      lng: 90.3623,
      address: "Mohammadpur, Tajmahal Road",
      ward: 45,
      mediaUrls: [
        "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80",
      ],
      upvoteCount: 33,
      authorId: users[3].id,
    },
    {
      title: "Stray dog menace near Mirpur section 12 school",
      body: "A pack of aggressive stray dogs near the primary school has bitten two children this week. Parents are scared to send kids. Animal control / city corporation help needed.",
      category: Category.SAFETY,
      severity: Severity.NORMAL,
      status: Status.OPEN,
      lat: 23.8068,
      lng: 90.3589,
      address: "Mirpur Section 12",
      ward: 3,
      isAnon: true,
      aiAllowed: true,
      upvoteCount: 96,
      authorId: users[0].id,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log(`  ✓ ${posts.length} posts seeded`);
  console.log("\n✅ Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
