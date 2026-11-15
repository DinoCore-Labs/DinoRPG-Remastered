import { describe, expect, it, vi } from 'vitest';

import { getActiveClinicStatuses } from '../../src/Clinic/Service/clinicActivity.service.js';
import { finishClinicSurgeryIfReady } from '../../src/Clinic/Service/clinicSurgery.service.js';
import { finishClinicTreatmentIfReady } from '../../src/Clinic/Service/clinicTreatment.service.js';

const USER_ID = 'b213f3ec-68bc-48c8-bcf3-53b8b0c0a124';
const NOW = new Date('2026-11-15T18:00:00.000Z');
const READY = new Date('2026-11-15T17:00:00.000Z');

describe('Clinic: database deadlines are authoritative', () => {
	it('exposes the pending treatment and surgery deadlines without reading Dinoz.stateTimer', async () => {
		const client = {
			clinicTreatment: {
				findUnique: vi.fn().mockResolvedValue({ dinozId: 10, readyAt: READY, finishedAt: null })
			},
			dinozSurgery: {
				findMany: vi.fn().mockResolvedValue([{ dinozId: 11, readyAt: READY }])
			}
		} as unknown as Parameters<typeof getActiveClinicStatuses>[2];
		const result = await getActiveClinicStatuses(USER_ID, [10, 11, 12], client);
		expect(result.get(10)).toEqual({ kind: 'treatment', readyAt: READY.toISOString() });
		expect(result.get(11)).toEqual({ kind: 'surgery', readyAt: READY.toISOString() });
		expect(result.has(12)).toBe(false);
	});

	it('does not expose finished treatments', async () => {
		const client = {
			clinicTreatment: {
				findUnique: vi.fn().mockResolvedValue({ dinozId: 10, readyAt: READY, finishedAt: NOW })
			},
			dinozSurgery: { findMany: vi.fn().mockResolvedValue([]) }
		} as unknown as Parameters<typeof getActiveClinicStatuses>[2];
		expect((await getActiveClinicStatuses(USER_ID, [10], client)).size).toBe(0);
	});

	it('heals and releases a Dinoz even if its legacy stateTimer differs from ClinicTreatment.readyAt', async () => {
		const tx = {
			$executeRaw: vi.fn().mockResolvedValue(1),
			clinicTreatment: {
				findUnique: vi.fn().mockResolvedValue({ dinozId: 10, readyAt: READY, finishedAt: null }),
				update: vi.fn().mockResolvedValue({})
			},
			dinoz: {
				findUnique: vi
					.fn()
					.mockResolvedValue({ id: 10, userId: USER_ID, state: 'clinic', stateTimer: null, maxLife: 130 }),
				updateMany: vi.fn().mockResolvedValue({ count: 1 })
			}
		} as unknown as Parameters<typeof finishClinicTreatmentIfReady>[0];
		const result = await finishClinicTreatmentIfReady(tx, USER_ID, 10, NOW);
		expect(result).toBe(true);
		expect(tx.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 10, userId: USER_ID, state: 'clinic' },
			data: { state: null, stateTimer: null, life: 130 }
		});
		expect(tx.clinicTreatment.update).toHaveBeenCalled();
	});

	it('applies cosmetic surgery after its deadline without comparing stateTimer', async () => {
		const tx = {
			$executeRaw: vi.fn().mockResolvedValue(1),
			dinozSurgery: {
				findUnique: vi.fn().mockResolvedValue({
					dinozId: 10,
					userId: USER_ID,
					readyAt: READY,
					finishedAt: null,
					newDisplay: '0000000000000000'
				}),
				update: vi.fn().mockResolvedValue({})
			},
			dinoz: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) }
		} as unknown as Parameters<typeof finishClinicSurgeryIfReady>[0];
		expect(await finishClinicSurgeryIfReady(tx, USER_ID, 10, NOW)).toBe(true);
		expect(tx.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 10, userId: USER_ID, state: 'clinic' },
			data: { state: null, stateTimer: null, display: '0000000000000000' }
		});
		expect(tx.dinozSurgery.update).toHaveBeenCalled();
	});
});
