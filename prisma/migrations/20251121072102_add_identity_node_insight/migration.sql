-- CreateTable
CREATE TABLE "IdentityNodeInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "summary" TEXT,
    "notes" TEXT,
    "excerpts" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityNodeInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdentityNodeInsight_userId_idx" ON "IdentityNodeInsight"("userId");

-- CreateIndex
CREATE INDEX "IdentityNodeInsight_nodeId_idx" ON "IdentityNodeInsight"("nodeId");

-- AddForeignKey
ALTER TABLE "IdentityNodeInsight" ADD CONSTRAINT "IdentityNodeInsight_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "IdentityNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
