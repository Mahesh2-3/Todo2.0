const fs = require('fs');
let code = fs.readFileSync('app/api/auth/tasks/route.js', 'utf8');

// Fix 1: Mongoose ObjectId in aggregate
code = code.replace(
  '          $match: {\n            userId,\n            templateId: { $in: templateIds },',
  '          $match: {\n            userId: new mongoose.Types.ObjectId(userId),\n            templateId: { $in: templateIds },'
);

// Fix 2: startDateObj initialization timezone issue
code = code.replace(
  '        if (lastStartDate) {\n          const lastDate = new Date(lastStartDate);\n          // Start backfilling from the day after the last instance\n          lastDate.setDate(lastDate.getDate() + 1);\n          startDateObj = lastDate;\n        } else {\n          startDateObj = template.createdAt\n            ? new Date(template.createdAt)\n            : new Date();\n        }',
  '        if (lastStartDate) {\n          const lastDate = new Date(lastStartDate + "T00:00:00");\n          // Start backfilling from the day after the last instance\n          lastDate.setDate(lastDate.getDate() + 1);\n          startDateObj = lastDate;\n        } else {\n          startDateObj = template.createdAt\n            ? new Date(template.createdAt)\n            : new Date();\n        }'
);

fs.writeFileSync('app/api/auth/tasks/route.js', code);
