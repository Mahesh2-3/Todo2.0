const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const Task = require("./app/models/Task.js");
const { getDatesBetween, getToday } = require("./app/lib/dateUtils.js");

async function run() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const userId = new mongoose.Types.ObjectId().toString();

  // Create a template
  const template = await Task.create({
    userId,
    title: "Morning Routine",
    type: "daily",
    isDaily: true,
    isTemplate: true,
    createdAt: new Date("2024-04-21T10:00:00Z")
  });

  const dailyTemplates = [template];
  const templateIds = [template._id];
  const today = "2024-04-22"; // Let's pretend today is 2024-04-22

  const lastInstances = await Task.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        templateId: { $in: templateIds },
        isTemplate: false
      }
    },
    { $sort: { startDate: -1 } },
    {
      $group: {
        _id: "$templateId",
        lastStartDate: { $first: "$startDate" }
      }
    }
  ]);

  const lastInstanceMap = new Map();
  lastInstances.forEach((inst) => {
    lastInstanceMap.set(inst._id.toString(), inst.lastStartDate);
  });

  const bulkOps = [];

  for (const t of dailyTemplates) {
    let startDateObj;
    const lastStartDate = lastInstanceMap.get(t._id.toString());

    if (lastStartDate) {
      const lastDate = new Date(lastStartDate + "T00:00:00");
      lastDate.setDate(lastDate.getDate() + 1);
      startDateObj = lastDate;
    } else {
      startDateObj = t.createdAt
        ? new Date(t.createdAt)
        : new Date();
    }

    const startDateStr = startDateObj.toLocaleDateString("en-CA");
    console.log("StartDateStr:", startDateStr, "Today:", today);
    const missingDates = getDatesBetween(startDateStr, today, 60);
    console.log("Missing Dates:", missingDates);

    for (const date of missingDates) {
      bulkOps.push({
        updateOne: {
          filter: {
            userId,
            templateId: t._id,
            startDate: date,
            isTemplate: false,
          },
          update: {
            $setOnInsert: {
              userId,
              title: t.title,
              description: t.description,
              type: "daily",
              isDaily: true,
              isTemplate: false,
              templateId: t._id,
              startDate: date,
              endDate: date,
              status: "Pending",
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    console.log("Executing bulkWrite:", bulkOps.length, "operations");
    await Task.bulkWrite(bulkOps);
  } else {
    console.log("No bulk operations to execute");
  }

  const generatedInstances = await Task.find({ isTemplate: false });
  console.log("Generated instances:");
  generatedInstances.forEach(i => console.log(i.startDate, i.title));

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

process.env.TZ = "America/Los_Angeles";
run().catch(console.error);
