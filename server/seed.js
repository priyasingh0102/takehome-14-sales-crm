// Seeds the database with demo users, companies, deals and history.

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Company from "./models/Company.js";
import Deal from "./models/Deal.js";
import DealHistory from "./models/DealHistory.js";
import DealAlert from "./models/DealAlert.js";

const DEMO_PASSWORD = "Password123!";

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");

  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Deal.deleteMany({}),
    DealHistory.deleteMany({}),
    DealAlert.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Creating users...");

  const manager = await User.create({
    name: "Morgan Reyes",
    email: "manager@demo.com",
    password: hashedPassword,
    role: "sales_manager",
  });

  const repA = await User.create({
    name: "Alex Chen",
    email: "alex@demo.com",
    password: hashedPassword,
    role: "sales_rep",
  });

  const repB = await User.create({
    name: "Bailey Kim",
    email: "bailey@demo.com",
    password: hashedPassword,
    role: "sales_rep",
  });

  console.log("Creating companies...");

  const [acme, globex, initech, umbrella] = await Company.create([
    {
      name: "Acme Corp",
      industry: "Manufacturing",
      website: "https://acme.example.com",
      owner: repA._id,
    },
    {
      name: "Globex Inc",
      industry: "Retail",
      website: "https://globex.example.com",
      owner: repA._id,
    },
    {
      name: "Initech",
      industry: "Software",
      website: "https://initech.example.com",
      owner: repB._id,
    },
    {
      name: "Umbrella Group",
      industry: "Pharmaceuticals",
      website: "https://umbrella.example.com",
      owner: repB._id,
    },
  ]);

  console.log("Creating deals...");

  const dealDefs = [
    {
      title: "Acme - Annual supply contract",
      company: acme._id,
      owner: repA._id,
      value: "45000.00",
      stage: "New",
      closeInDays: 20,
    },
    {
      title: "Acme - Warehouse automation",
      company: acme._id,
      owner: repA._id,
      value: "120000.00",
      stage: "Qualified",
      closeInDays: 30,
    },
    {
      title: "Globex - POS refresh",
      company: globex._id,
      owner: repA._id,
      value: "18000.00",
      stage: "Proposal",
      closeInDays: -2,
      collaborators: [repB._id],
    },
    {
      title: "Globex - Loyalty platform",
      company: globex._id,
      owner: repA._id,
      value: "62000.00",
      stage: "Negotiation",
      closeInDays: -5,
    },
    {
      title: "Acme - Legacy pilot (lost)",
      company: acme._id,
      owner: repA._id,
      value: "9000.00",
      stage: "Lost",
      closeInDays: -15,
    },
    {
      title: "Initech - SaaS migration",
      company: initech._id,
      owner: repB._id,
      value: "85000.00",
      stage: "New",
      closeInDays: 25,
    },
    {
      title: "Initech - Support renewal",
      company: initech._id,
      owner: repB._id,
      value: "15000.00",
      stage: "Won",
      closeInDays: -10,
    },
    {
      title: "Umbrella - Compliance suite",
      company: umbrella._id,
      owner: repB._id,
      value: "230000.00",
      stage: "Negotiation",
      closeInDays: 10,
      collaborators: [repA._id],
    },
    {
      title: "Umbrella - Field sample tracker",
      company: umbrella._id,
      owner: repB._id,
      value: "40000.00",
      stage: "Proposal",
      closeInDays: -1,
    },
  ];

  for (const def of dealDefs) {
    const deal = await Deal.create({
      title: def.title,
      company: def.company,
      owner: def.owner,
      value: def.value,
      stage: def.stage,
      expectedCloseDate: daysFromNow(def.closeInDays),
      collaborators: def.collaborators || [],
    });

    await DealHistory.create({
      deal: deal._id,
      type: "created",
      newStage: "New",
      performedBy: def.owner,
    });

    if (def.stage !== "New") {
      await DealHistory.create({
        deal: deal._id,
        type: "stage_change",
        oldStage: "New",
        newStage: def.stage,
        performedBy: def.owner,
      });
    }
  }

  console.log("\nSeed complete.");
  console.log("Demo credentials:");
  console.log(`Sales manager: ${manager.email} / ${DEMO_PASSWORD}`);
  console.log(`Sales rep: ${repA.email} / ${DEMO_PASSWORD}`);
  console.log(`Sales rep: ${repB.email} / ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});