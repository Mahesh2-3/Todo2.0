const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Task = require("./app/models/Task.js");

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  const userIdStr = new mongoose.Types.ObjectId().toString();
  const templateId = new mongoose.Types.ObjectId();

  await Task.create({
    userId: userIdStr,
    title: "Test template",
    type: "daily",
    isTemplate: true
  });

  await Task.create({
    userId: userIdStr,
    title: "Test instance",
    type: "daily",
    isTemplate: false,
    templateId: templateId,
    startDate: "2024-04-20"
  });

  const aggregateResult = await Task.aggregate([
    {
      $match: {
        userId: userIdStr,
        isTemplate: false
      }
    }
  ]);
  console.log("Aggregate result with string userId:", aggregateResult.length);

  const aggregateResultObj = await Task.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userIdStr),
        isTemplate: false
      }
    }
  ]);
  console.log("Aggregate result with ObjectId:", aggregateResultObj.length);

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}
main();
