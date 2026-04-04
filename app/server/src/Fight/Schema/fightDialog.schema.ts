import { z } from 'zod';

export const processDialogFightBodySchema = z.object({
	dinozId: z.coerce.number().int().positive(),
	dialogId: z.string().min(1),
	phaseId: z.string().min(1)
});

export type ProcessDialogFightInput = z.infer<typeof processDialogFightBodySchema>;
