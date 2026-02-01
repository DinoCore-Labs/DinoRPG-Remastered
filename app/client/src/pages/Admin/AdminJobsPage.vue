<template>
	<div class="adminJobs">
		<TitleHeader title="Admin" header="Jobs" sub-header="Scheduler" />

		<DZDisclaimer help round content="admin.jobs.disclaimer" />

		<div class="toolbar">
			<DZButton :disabled="loading" @click="refresh()">
				{{ loading ? 'Loading…' : 'Refresh' }}
			</DZButton>
		</div>

		<div v-if="error" class="error">{{ error }}</div>

		<!-- Jobs -->
		<DZTable>
			<tr>
				<th>Key</th>
				<th>Name</th>
				<th>Type</th>
				<th>Status</th>
				<th>Next</th>
				<th>Last</th>
				<th>Error</th>
				<th></th>
			</tr>

			<tr v-for="job in jobs" :key="job.key" :class="{ selected: job.key === selectedKey }" @click="select(job.key)">
				<td class="mono">{{ job.key }}</td>
				<td>{{ job.name }}</td>
				<td class="mono">{{ formatType(job) }}</td>
				<td class="mono">{{ job.status }}</td>
				<td class="mono">{{ formatDate(job.nextRunAt) }}</td>
				<td class="mono">{{ formatDate(job.lastRunAt) }}</td>
				<td class="err" :title="job.lastError ?? ''">{{ job.lastError ?? '—' }}</td>
				<td @click.stop>
					<DZButton small :disabled="runningKey === job.key" @click="run(job.key)">
						{{ runningKey === job.key ? 'Running…' : 'Run now' }}
					</DZButton>
				</td>
			</tr>
		</DZTable>

		<!-- Runs -->
		<div v-if="selectedKey" class="runs">
			<h3>
				Runs: <span class="mono">{{ selectedKey }}</span>
			</h3>

			<div class="toolbar">
				<DZButton small :disabled="runsLoading" @click="refreshRuns()">
					{{ runsLoading ? 'Loading…' : 'Refresh runs' }}
				</DZButton>
			</div>

			<DZTable>
				<tr>
					<th>Started</th>
					<th>Ended</th>
					<th>Success</th>
					<th>By</th>
					<th>Error</th>
				</tr>

				<tr v-for="r in runs" :key="r.id">
					<td class="mono">{{ formatDate(r.startedAt) }}</td>
					<td class="mono">{{ formatDate(r.endedAt) }}</td>
					<td class="mono">{{ r.success === true ? 'YES' : r.success === false ? 'NO' : '—' }}</td>
					<td class="mono">{{ r.triggeredBy ?? '—' }}</td>
					<td class="err" :title="r.error ?? ''">{{ r.error ?? '—' }}</td>
				</tr>
			</DZTable>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { JobDefinition, JobRun } from '@dinorpg/core/models/admin/adminJobs.js';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import DZButton from '../../components/utils/DZButton.vue';
import DZTable from '../../components/utils/DZTable.vue';
import DZDisclaimer from '../../components/utils/DZDisclaimer.vue';

import { AdminJobsService } from '../../services/adminJobs.service';

export default defineComponent({
	name: 'AdminJobs',
	components: { TitleHeader, DZButton, DZTable, DZDisclaimer },
	data() {
		return {
			jobs: [] as JobDefinition[],
			runs: [] as JobRun[],
			selectedKey: '' as string,
			loading: false,
			runsLoading: false,
			runningKey: '' as string,
			error: '' as string
		};
	},
	async mounted() {
		await this.refresh();
	},
	methods: {
		async refresh() {
			this.error = '';
			this.loading = true;
			try {
				this.jobs = await AdminJobsService.list();
				if (!this.selectedKey && this.jobs.length) {
					await this.select(this.jobs[0]!.key);
				}
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.loading = false;
			}
		},

		async select(key: string) {
			this.selectedKey = key;
			await this.refreshRuns();
		},

		async refreshRuns() {
			if (!this.selectedKey) return;
			this.error = '';
			this.runsLoading = true;
			try {
				this.runs = await AdminJobsService.getRuns(this.selectedKey);
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.runsLoading = false;
			}
		},

		async run(key: string) {
			this.error = '';
			this.runningKey = key;
			try {
				await AdminJobsService.runNow(key);
				await this.refresh();
				if (this.selectedKey === key) await this.refreshRuns();
			} catch (err: any) {
				this.error = err?.message ?? String(err);
			} finally {
				this.runningKey = '';
			}
		},

		formatDate(value?: string | null) {
			if (!value) return '—';
			const d = new Date(value);
			return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
		},

		formatType(job: JobDefinition) {
			if (job.type === 'DAILY_AT') {
				const hh = String(job.dailyHour ?? 0).padStart(2, '0');
				const mm = String(job.dailyMinute ?? 0).padStart(2, '0');
				return `DAILY ${hh}:${mm} ${job.timezone}`;
			}
			if (job.type === 'INTERVAL') {
				return `INTERVAL ${Math.round((job.intervalMs ?? 0) / 1000)}s`;
			}
			return job.type;
		}
	}
});
</script>

<style scoped>
.adminJobs {
	padding: 12px;
}
.toolbar {
	margin: 10px 0;
	display: flex;
	gap: 10px;
}
.mono {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
.error {
	margin: 10px 0;
	padding: 10px;
	border: 1px solid rgba(255, 0, 0, 0.35);
	background: rgba(255, 0, 0, 0.12);
	border-radius: 10px;
}
.err {
	max-width: 340px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.selected {
	outline: 1px solid rgba(255, 255, 255, 0.15);
}
.runs {
	margin-top: 16px;
}
</style>
