-- CreateTable
CREATE TABLE "TopicAlias" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "canonicalNodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "embedding" DOUBLE PRECISION[],
    "contexts" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TopicAlias" ADD CONSTRAINT "TopicAlias_canonicalNodeId_fkey" FOREIGN KEY ("canonicalNodeId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
