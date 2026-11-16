import { describe, expect, it, vi } from 'vitest';

import { finishReadyClinicOperations } from '../../src/Clinic/Service/clinicActivity.service.js';

const USER_ID = 'ba717fe2-383c-418b-a3ce-1921670db51a';
const NOW = new Date('2026-11-16T14:00:00.000Z');
const PAST = new Date('2026-11-16T13:00:00.000Z');
const FUTURE = new Date('2026-11-16T15:00:00.000Z');

type Tx = Parameters<typeof finishReadyClinicOperations>[0];

describe('Clinique — relevé groupé des opérations échues', () => {
	it('ne fait aucune requête si le joueur ne possède aucun Dinoz', async () => {
		const tx = {
			clinicTreatment: { findUnique: vi.fn() },
			dinozSurgery: { findMany: vi.fn() }
		} as unknown as Tx;
		await finishReadyClinicOperations(tx, USER_ID, [], NOW);
		expect(tx.clinicTreatment.findUnique).not.toHaveBeenCalled();
		expect(tx.dinozSurgery.findMany).not.toHaveBeenCalled();
	});

	it('ne verrouille ni ne termine une opération tant que son heure n’est pas arrivée', async () => {
		const tx = {
			$executeRaw: vi.fn(),
			clinicTreatment: {
				findUnique: vi.fn().mockResolvedValue({ dinozId: 10, readyAt: FUTURE, finishedAt: null })
			},
			dinozSurgery: {
				findMany: vi.fn().mockResolvedValue([{ dinozId: 11, readyAt: FUTURE }])
			}
		} as unknown as Tx;
		await finishReadyClinicOperations(tx, USER_ID, [10, 11, 12], NOW);
		expect(tx.clinicTreatment.findUnique).toHaveBeenCalledTimes(1);
		expect(tx.dinozSurgery.findMany).toHaveBeenCalledTimes(1);
		expect(tx.dinozSurgery.findMany).toHaveBeenCalledWith({
			where: { userId: USER_ID, dinozId: { in: [10, 11, 12] }, finishedAt: null },
			select: { dinozId: true, readyAt: true }
		});
		expect(tx.$executeRaw).not.toHaveBeenCalled();
	});

	it('finalise les soins et chirurgies échus en conservant les contrôles existants', async () => {
		const tx = {
			$executeRaw: vi.fn().mockResolvedValue(1),
			clinicTreatment: {
				findUnique: vi.fn().mockResolvedValue({
					userId: USER_ID,
					dinozId: 10,
					readyAt: PAST,
					finishedAt: null
				}),
				update: vi.fn().mockResolvedValue({})
			},
			dinozSurgery: {
				findMany: vi.fn().mockResolvedValue([{ dinozId: 11, readyAt: PAST }]),
				findUnique: vi.fn().mockResolvedValue({
					userId: USER_ID,
					dinozId: 11,
					readyAt: PAST,
					finishedAt: null,
					newDisplay: '00BBBBBBBBBBB000'
				}),
				update: vi.fn().mockResolvedValue({})
			},
			dinoz: {
				findUnique: vi.fn().mockResolvedValue({ id: 10, userId: USER_ID, state: 'clinic', maxLife: 130 }),
				updateMany: vi.fn().mockResolvedValue({ count: 1 })
			}
		} as unknown as Tx;
		await finishReadyClinicOperations(tx, USER_ID, [10, 11, 12], NOW);
		expect(tx.clinicTreatment.findUnique).toHaveBeenCalledTimes(2); // Relevé + finalisation
		expect(tx.dinozSurgery.findMany).toHaveBeenCalledTimes(1);
		expect(tx.dinozSurgery.findUnique).toHaveBeenCalledTimes(1);
		expect(tx.$executeRaw).toHaveBeenCalledTimes(2); // Verrou seulement pour les 2 opérations dues
		expect(tx.dinoz.updateMany).toHaveBeenCalledTimes(2);
		expect(tx.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 10, userId: USER_ID, state: 'clinic' },
			data: { state: null, stateTimer: null, life: 130 }
		});
		expect(tx.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 11, userId: USER_ID, state: 'clinic' },
			data: { state: null, stateTimer: null, display: '00BBBBBBBBBBB000' }
		});
		expect(tx.clinicTreatment.update).toHaveBeenCalledTimes(1);
		expect(tx.dinozSurgery.update).toHaveBeenCalledTimes(1);
	});
});
