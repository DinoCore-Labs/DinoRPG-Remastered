import z from 'zod';

export const maintenanceStatusSchema = z.object({
	enabled: z.boolean()
});
