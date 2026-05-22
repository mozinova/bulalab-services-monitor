/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Automation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChannelData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeBase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `McpServers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Packages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ToolData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transcription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsageLimits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoiceChats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('UP', 'DOWN', 'DEGRADED');

-- CreateEnum
CREATE TYPE "ServiceProtocol" AS ENUM ('HTTP', 'SIP');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Automation" DROP CONSTRAINT "Automation_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelData" DROP CONSTRAINT "ChannelData_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelData" DROP CONSTRAINT "ChannelData_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeBase" DROP CONSTRAINT "KnowledgeBase_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "McpServers" DROP CONSTRAINT "McpServers_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "ToolData" DROP CONSTRAINT "ToolData_toolId_fkey";

-- DropForeignKey
ALTER TABLE "ToolData" DROP CONSTRAINT "ToolData_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_voiceChatId_fkey";

-- DropForeignKey
ALTER TABLE "VoiceChats" DROP CONSTRAINT "VoiceChats_channelId_fkey";

-- DropForeignKey
ALTER TABLE "VoiceChats" DROP CONSTRAINT "VoiceChats_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_organizationId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Automation";

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "ChannelData";

-- DropTable
DROP TABLE "KnowledgeBase";

-- DropTable
DROP TABLE "McpServers";

-- DropTable
DROP TABLE "Messages";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "OrganizationMember";

-- DropTable
DROP TABLE "Packages";

-- DropTable
DROP TABLE "Tool";

-- DropTable
DROP TABLE "ToolData";

-- DropTable
DROP TABLE "Transcription";

-- DropTable
DROP TABLE "UsageLimits";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "VoiceChats";

-- DropTable
DROP TABLE "Workspace";

-- DropEnum
DROP TYPE "AutoTrigger";

-- DropEnum
DROP TYPE "ChannelType";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'UP',
    "interval" INTEGER NOT NULL DEFAULT 60,
    "protocol" "ServiceProtocol" NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uptimes" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uptimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downtime_reports" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "statusCode" INTEGER,
    "error" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downtime_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "uptimes" ADD CONSTRAINT "uptimes_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downtime_reports" ADD CONSTRAINT "downtime_reports_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
