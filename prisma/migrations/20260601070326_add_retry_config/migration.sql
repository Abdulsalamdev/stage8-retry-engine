/*
  Warnings:

  - You are about to alter the column `delayUsed` on the `Attempt` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Made the column `delayUsed` on table `Attempt` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "statusCode" INTEGER,
    "error" TEXT,
    "delayUsed" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attempt" ("attemptNumber", "createdAt", "delayUsed", "error", "id", "requestId", "statusCode") SELECT "attemptNumber", "createdAt", "delayUsed", "error", "id", "requestId", "statusCode" FROM "Attempt";
DROP TABLE "Attempt";
ALTER TABLE "new_Attempt" RENAME TO "Attempt";
CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "body" TEXT,
    "status" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" DATETIME,
    "lastError" TEXT,
    "result" TEXT,
    "maxRetries" INTEGER NOT NULL DEFAULT 5,
    "backoffMs" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Request" ("attemptCount", "backoffMs", "body", "createdAt", "id", "lastError", "maxRetries", "method", "nextRetryAt", "result", "status", "updatedAt", "url") SELECT "attemptCount", "backoffMs", "body", "createdAt", "id", "lastError", "maxRetries", "method", "nextRetryAt", "result", "status", "updatedAt", "url" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
