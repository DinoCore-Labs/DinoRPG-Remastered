import { z } from 'zod';

export const processDialogFightBodySchema = z.object({
	dinozId: z.coerce.number().int().positive(),
	dialogId: z.string().min(1),
	phaseId: z.string().min(1),
	autoReequip: z.boolean().optional()
});

export type ProcessDialogFightInput = z.infer<typeof processDialogFightBodySchema>;
