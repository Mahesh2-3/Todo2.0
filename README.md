# Todo 2.0 - Personal Productivity & Diary App

Todo 2.0 is a modern, full-stack task management application built with **Next.js 15** and **MongoDB**. It helps you organize your daily life, plan future tasks, and maintain a personal diary, all within a clean and responsive interface.

## 🚀 Features

### 📊 Dashboard & Overview

- **Overview Tab**:
  - **Quick Summary**: Circular progress charts for Completed, In Progress, and Pending tasks.
  - **Expiring Tasks**: Stay ahead with a dedicated view for tasks expiring soon.
  - **Task Filtering**: Filter tasks by date (Today, Yesterday, Calendar) and Status.
- **Dashboard Tab**:
  - **Weekly Trend**: Visualize your weekly completion rate with a smooth Area Chart.
  - **Activity Heatmap**: View your task completion activity over the last year, similar to GitHub contributions.

### ✅ Task Management

- **Daily Tasks**: Focus on what needs to be done today.
- **Scheduled Tasks**: Plan for the future with date-specific tasks.
- **Status Tracking**: Easily update task status (Pending → In Progress → Completed).
- **Search & Filter**: Find any task instantly by keyword, date, or status.
- **Templates**: Create reusable task templates for recurring activities.

### 📔 Personal Diary

- **Daily Journaling**: Write and save your thoughts daily.
- **Streak Protection**: Get notified if you miss a diary entry for the previous day.

### 🔔 Smart Notifications

- **Task Alerts**: Receive alerts for expired or overdue tasks.
- **Diary Reminders**: Gentle nudges to keep your journaling habit alive.

### 📱 Responsive Design

- Fully optimized for both desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: JavaScript / React 19
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Data Visualization**: `recharts`, `react-calendar-heatmap`, `react-circular-progressbar`
- **UI Components**: `react-datepicker`, `react-icons`, `react-toastify`, `react-responsive`

---

## 📦 Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/todo2.0.git
cd todo2.0
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure

- `app/` - Main application code (App Router).
  - `components/` - Reusable UI components (Navbar, TaskCard, StatusChart, etc.).
  - `models/` - Mongoose schemas (User, Task, Diary).
  - `tabs/` - Main views (Dashboard, DailyTasks, ScheduledTasks).
  - `api/` - Backend API routes.
- `public/` - Static assets.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
