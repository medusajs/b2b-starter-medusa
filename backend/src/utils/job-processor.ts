/**
 * ⚙️ YSH Async Job Processor
 * Framework for handling long-running API tasks with status tracking
 */

import { EventEmitter } from 'events';
import { CacheManager } from './cache-manager';

// ============================================================================
// Job Types and States
// ============================================================================

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobData {
    id: string;
    type: string;
    status: JobStatus;
    progress: number; // 0-100
    data: any;
    result?: any;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number; // in milliseconds
    priority: number; // 1-10, higher = more important
    retryCount: number;
    maxRetries: number;
    timeout?: number; // in milliseconds
}

export interface JobOptions {
    priority?: number;
    timeout?: number;
    maxRetries?: number;
    estimatedDuration?: number;
    onProgress?: (progress: number) => void;
    onComplete?: (result: any) => void;
    onError?: (error: string) => void;
}

// ============================================================================
// Job Queue
// ============================================================================

export class JobQueue extends EventEmitter {
    private static instance: JobQueue;
    private cache: CacheManager;
    private jobs: Map<string, JobData> = new Map();
    private processing: Set<string> = new Set();
    private maxConcurrentJobs: number = 5;

    private constructor() {
        super();
        this.cache = CacheManager.getInstance();
        this.setupEventHandlers();
    }

    static getInstance(): JobQueue {
        if (!JobQueue.instance) {
            JobQueue.instance = new JobQueue();
        }
        return JobQueue.instance;
    }

    // ============================================================================
    // Job Management
    // ============================================================================

    async createJob(
        type: string,
        data: any,
        options: JobOptions = {}
    ): Promise<string> {
        const jobId = this.generateJobId();
        const now = new Date();

        const job: JobData = {
            id: jobId,
            type,
            status: 'queued',
            progress: 0,
            data,
            createdAt: now,
            updatedAt: now,
            priority: options.priority || 5,
            retryCount: 0,
            maxRetries: options.maxRetries || 3,
            timeout: options.timeout,
            estimatedDuration: options.estimatedDuration,
        };

        this.jobs.set(jobId, job);
        await this.persistJob(job);

        // Emit job created event
        this.emit('jobCreated', job);

        // Try to start processing immediately
        this.processNextJob();

        return jobId;
    }

    async getJob(jobId: string): Promise<JobData | null> {
        // Check memory first
        if (this.jobs.has(jobId)) {
            return this.jobs.get(jobId)!;
        }

        // Check cache
        const cached = await this.cache.get<JobData>(`job:${jobId}`);
        if (cached) {
            this.jobs.set(jobId, cached);
            return cached;
        }

        return null;
    }

    async updateJobProgress(jobId: string, progress: number, data?: any): Promise<void> {
        const job = await this.getJob(jobId);
        if (!job) return;

        job.progress = Math.min(100, Math.max(0, progress));
        job.updatedAt = new Date();

        if (data) {
            job.data = { ...job.data, ...data };
        }

        await this.persistJob(job);
        this.emit('jobProgress', job);
    }

    async completeJob(jobId: string, result: any): Promise<void> {
        const job = await this.getJob(jobId);
        if (!job) return;

        job.status = 'completed';
        job.progress = 100;
        job.result = result;
        job.completedAt = new Date();
        job.updatedAt = new Date();

        this.processing.delete(jobId);
        await this.persistJob(job);

        this.emit('jobCompleted', job);
        this.processNextJob();
    }

    async failJob(jobId: string, error: string): Promise<void> {
        const job = await this.getJob(jobId);
        if (!job) return;

        job.status = 'failed';
        job.error = error;
        job.updatedAt = new Date();

        this.processing.delete(jobId);

        // Check if we should retry
        if (job.retryCount < job.maxRetries) {
            job.retryCount++;
            job.status = 'queued';
            job.error = undefined;
            await this.persistJob(job);
            this.emit('jobRetried', job);
            this.processNextJob();
        } else {
            await this.persistJob(job);
            this.emit('jobFailed', job);
            this.processNextJob();
        }
    }

    async cancelJob(jobId: string): Promise<void> {
        const job = await this.getJob(jobId);
        if (!job || job.status === 'completed' || job.status === 'failed') return;

        job.status = 'cancelled';
        job.updatedAt = new Date();

        this.processing.delete(jobId);
        await this.persistJob(job);

        this.emit('jobCancelled', job);
        this.processNextJob();
    }

    // ============================================================================
    // Job Processing
    // ============================================================================

    private async processNextJob(): Promise<void> {
        if (this.processing.size >= this.maxConcurrentJobs) {
            return;
        }

        // Find next job to process (by priority, then by creation time)
        const queuedJobs = Array.from(this.jobs.values())
            .filter(job => job.status === 'queued')
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority; // Higher priority first
                }
                return a.createdAt.getTime() - b.createdAt.getTime(); // Older first
            });

        if (queuedJobs.length === 0) {
            return;
        }

        const job = queuedJobs[0];
        await this.startProcessingJob(job);
    }

    private async startProcessingJob(job: JobData): Promise<void> {
        job.status = 'processing';
        job.startedAt = new Date();
        job.updatedAt = new Date();

        this.processing.add(job.id);
        await this.persistJob(job);

        this.emit('jobStarted', job);

        // Start processing in background
        this.processJob(job).catch(error => {
            console.error(`[JobProcessor] Error processing job ${job.id}:`, error);
            this.failJob(job.id, error.message);
        });
    }

    private async processJob(job: JobData): Promise<void> {
        // This would be overridden by specific job processors
        // For now, simulate processing time
        const processingTime = job.estimatedDuration || 5000;

        for (let progress = 0; progress <= 100; progress += 10) {
            await this.updateJobProgress(job.id, progress);
            await new Promise(resolve => setTimeout(resolve, processingTime / 10));
        }

        await this.completeJob(job.id, { message: 'Job completed successfully' });
    }

    // ============================================================================
    // Job Statistics
    // ============================================================================

    async getStats(): Promise<{
        total: number;
        queued: number;
        processing: number;
        completed: number;
        failed: number;
        avgProcessingTime: number;
    }> {
        const allJobs = Array.from(this.jobs.values());
        const completedJobs = allJobs.filter(job => job.status === 'completed');

        const avgProcessingTime = completedJobs.length > 0
            ? completedJobs.reduce((sum, job) => {
                return sum + (job.completedAt!.getTime() - job.startedAt!.getTime());
            }, 0) / completedJobs.length
            : 0;

        return {
            total: allJobs.length,
            queued: allJobs.filter(job => job.status === 'queued').length,
            processing: allJobs.filter(job => job.status === 'processing').length,
            completed: completedJobs.length,
            failed: allJobs.filter(job => job.status === 'failed').length,
            avgProcessingTime,
        };
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

    private setupEventHandlers(): void {
        this.on('jobCreated', (job) => {
            console.log(`[JobQueue] Job created: ${job.id} (${job.type})`);
        });

        this.on('jobStarted', (job) => {
            console.log(`[JobQueue] Job started: ${job.id}`);
        });

        this.on('jobProgress', (job) => {
            console.log(`[JobQueue] Job progress: ${job.id} - ${job.progress}%`);
        });

        this.on('jobCompleted', (job) => {
            console.log(`[JobQueue] Job completed: ${job.id}`);
        });

        this.on('jobFailed', (job) => {
            console.error(`[JobQueue] Job failed: ${job.id} - ${job.error}`);
        });
    }

    private async persistJob(job: JobData): Promise<void> {
        await this.cache.set(`job:${job.id}`, job, 24 * 60 * 60); // 24 hours
    }

    private generateJobId(): string {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// ============================================================================
// Job Processor Registry
// ============================================================================

export class JobProcessorRegistry {
    private static processors: Map<string, (job: JobData) => Promise<any>> = new Map();

    static register(type: string, processor: (job: JobData) => Promise<any>): void {
        this.processors.set(type, processor);
    }

    static getProcessor(type: string): ((job: JobData) => Promise<any>) | undefined {
        return this.processors.get(type);
    }
}

// ============================================================================
// Singleton Instances
// ============================================================================

export const jobQueue = JobQueue.getInstance();