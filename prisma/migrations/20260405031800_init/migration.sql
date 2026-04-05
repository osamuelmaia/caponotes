-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "day" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "channels" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "week" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "week" TEXT NOT NULL,
    "newSignups" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "bestPost" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "hook" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMetric_week_key" ON "WeeklyMetric"("week");
