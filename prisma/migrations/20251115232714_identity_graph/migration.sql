-- CreateTable
CREATE TABLE "IdentityNode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "ring" INTEGER,

    CONSTRAINT "IdentityNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityEdge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "IdentityEdge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IdentityEdge" ADD CONSTRAINT "IdentityEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IdentityNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityEdge" ADD CONSTRAINT "IdentityEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "IdentityNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
