import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Resume {
    id: number;
    candidateId: number;
    filePath: string;
    fileType: string;
    uploadDate: Date;

    constructor(data: any) {
        this.id = data?.id;
        this.candidateId = data?.candidateId;
        this.filePath = data?.filePath;
        this.fileType = data?.fileType;
        this.uploadDate = new Date();
    }
}