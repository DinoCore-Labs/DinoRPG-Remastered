export type JobStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type JobType = 'DAILY_AT' | 'INTERVAL';

export interface JobDefinition {
	id: string;
	key: string;
	name: string;
	type: JobType;
	enabled: boolean;

	timezone: string;
	dailyHour?: number | null;
	dailyMinute?: number | null;
	intervalMs?: number | null;

	status: JobStatus;
	lastRunAt?: string | null;
	nextRunAt?: string | null;
	lastError?: string | null;

	lockedAt?: string | null;
	lockedBy?: string | null;
	lockTimeoutS: number;

	createdAt: string;
	updatedAt: string;
}

export interface JobRun {
	id: string;
	startedAt: string;
	endedAt?: string | null;
	success?: boolean | null;
	error?: string | null;
	triggeredBy?: string | null;
}
