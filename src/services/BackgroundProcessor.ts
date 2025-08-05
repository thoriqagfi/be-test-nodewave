import Logger from '$pkg/logger';

export class BackgroundProcessor {
    private static instance: BackgroundProcessor;
    private processingQueue: Map<string, boolean> = new Map();

    static getInstance(): BackgroundProcessor {
        if (!BackgroundProcessor.instance) {
            BackgroundProcessor.instance = new BackgroundProcessor();
        }
        return BackgroundProcessor.instance;
    }

    async addToQueue(fileId: string, processor: () => Promise<void>): Promise<void> {
        if (this.processingQueue.has(fileId)) {
            Logger.warn(`File ${fileId} is already being processed`);
            return;
        }

        this.processingQueue.set(fileId, true);

        try {
            await processor();
        } catch (error) {
            Logger.error(`Error processing file ${fileId}: ${error}`);
        } finally {
            this.processingQueue.delete(fileId);
        }
    }

    isProcessing(fileId: string): boolean {
        return this.processingQueue.has(fileId);
    }

    getQueueSize(): number {
        return this.processingQueue.size;
    }
}