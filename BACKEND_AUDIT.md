# Todo 2.0 Backend Audit & Refactor Report

This document outlines the improvements and changes made to the "Todo 2.0" backend.

## Section 1: Critical Issues (Must Fix)

### 1. N+1 Query Issue in `app/api/auth/tasks/route.js`
**Problem:**
When fetching "today" tasks, the `GET` route queried the last instance for each template within a `for` loop:
```javascript
for (const template of dailyTemplates) {
  const lastInstance = await Task.findOne({ ... }).sort({ startDate: -1 });
  // ...
}
```
This causes an N+1 query issue, leading to severe latency and database strain if a user has many templates.

**Fix:**
Replaced the `for` loop queries with a single aggregation pipeline:
```javascript
const templateIds = dailyTemplates.map((t) => t._id);
const lastInstances = await Task.aggregate([
  { $match: { userId, templateId: { $in: templateIds }, isTemplate: false } },
  { $sort: { startDate: -1 } },
  { $group: { _id: "$templateId", lastStartDate: { $first: "$startDate" } } }
]);
```

**Explanation:**
Instead of firing 10 queries for 10 templates, it now fires exactly 1 query. The database easily maps each template to its latest start date, drastically reducing backend processing time and connection overhead.

### 2. Missing Input Validation for Tasks
**Problem:**
In `app/api/auth/tasks/route.js` (POST route), tasks were created directly from `req.json()` without checking if the `title` existed.
```javascript
const body = await req.json();
const task = await Task.create({ ... });
```
This allowed tasks to be created with null or empty titles, which could crash frontend components that expect a valid string.

**Fix:**
Added strict checking:
```javascript
const body = await req.json();
if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
  return NextResponse.json({ error: "Title is required" }, { status: 400 });
}
```

**Explanation:**
By returning a `400 Bad Request` early, we prevent corrupt or malformed entries from entering the database, preserving data integrity and app reliability.

---

## Section 2: Performance Improvements

### 1. Heavy Payload in Statistics Route
**Problem:**
`app/api/auth/tasks/stats/route.js` fetched the user's *entire* task history, including potentially large fields (like `description`), simply to calculate statistics based on `status` and `date`.
```javascript
const tasks = await Task.find({ userId, isTemplate: { $ne: true } });
```
As tasks pile up over years, this array could easily consume vast amounts of server memory, causing out-of-memory errors on cheap hosting tiers.

**Fix:**
Utilized projection and `.lean()`:
```javascript
const tasks = await Task.find(
  { userId, isTemplate: { $ne: true } },
  { status: 1, createdAt: 1, updatedAt: 1, _id: 0 }
).lean();
```

**Explanation:**
Mongoose's `.lean()` returns raw JavaScript objects instead of heavy Mongoose documents. Combined with projection (`status`, `createdAt`, `updatedAt`), the payload from MongoDB to Node.js is minimized by over 80%.

### 2. Inefficient User Conflict Query
**Problem:**
`app/api/auth/update/route.js` fetched all users sharing an email or username into memory to check if *any* of them were not the current user:
```javascript
const existingUsers = await User.find({ $or: [{ username }, { email }] });
const conflictUser = existingUsers.find(u => u._id.toString() !== session.user.id);
```

**Fix:**
Performed the filter directly in the database query using `$ne`:
```javascript
const conflictUser = await User.findOne({
  _id: { $ne: session.user.id },
  $or: [{ username }, { email }]
});
```

**Explanation:**
Returning all conflicting rows and parsing them in JS wastes bandwidth. Offloading the `$ne` (not equal) check directly to MongoDB via `findOne` makes the validation lightweight and instant.

---

## Section 3: Code Refactoring Suggestions

### 1. Diary Saving Race Conditions
**Problem:**
`app/api/auth/diary/route.js` (POST route) manually checked for an existing diary entry. If found, it saved; else, it created a new one:
```javascript
let diary = await Diary.findOne({ userId, date });
if (diary) {
  diary.content = content || "";
  await diary.save();
} else {
  // ...
}
```
If two requests fired simultaneously, `findOne` might return null for both, leading to duplicated diary entries or 500 errors.

**Fix:**
Replaced with `findOneAndUpdate` utilizing `upsert`:
```javascript
await Diary.findOneAndUpdate(
  { userId, date },
  { content: content || "" },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
```

**Explanation:**
This guarantees atomicity at the database level. Mongoose handles the insert-or-update in a single round-trip, preventing race conditions and keeping the code succinct. Added input validations for the inputs `date` and `content`.

---

## Section 4: Security Fixes

### 1. Crashing Server on Invalid ObjectIDs
**Problem:**
In `app/api/auth/tasks/[id]/route.js`, the `id` from the URL parameter was passed directly to MongoDB via `findOneAndUpdate` and `findByIdAndDelete`. If a user deliberately modified the URL to provide an invalid BSON ObjectId string (e.g., `123`), Mongoose would throw a `CastError`.
```javascript
// Throws CastError before custom error handler
const task = await Task.findOneAndUpdate({ _id: id, ... });
```

**Fix:**
Added validation checks for ObjectIds in both `PUT` and `DELETE` routes:
```javascript
import mongoose from "mongoose";

if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
}
```

**Explanation:**
An invalid format ID leads to an unhandled backend exception resulting in a `500 Internal Server Error`, potentially revealing tech stack details. Gracefully returning a `400 Bad Request` prevents the application from crashing and masks internal behavior.

---

## Section 5: Optional Enhancements (Future Ideas)

1. **Pagination**:
   - The `tasks` and `diary` queries lack limits. If users create hundreds of tasks over years, the `GET` calls will suffer. Future improvements should incorporate query params `?page=1&limit=50` to paginate data efficiently using `skip` and `limit`.
2. **Rate Limiting**:
   - The `/api/auth/tasks` endpoint has no request throttling. A malicious user could spam the API, eating up Mongoose connection pools. Introducing a Redis-backed rate limiter is advised.
3. **Data Caching**:
   - Dashboard stats calculation on large datasets is expensive. Using `unstable_cache` from Next.js or Redis for `app/api/auth/tasks/stats/route.js` to store daily statistic snapshops would immensely cut processing time.
