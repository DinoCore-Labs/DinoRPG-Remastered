import { runGameLogMaintenance } from '../../Gamelog/Controller/gamelogMaintenance.controller.js';

export async function gameLogMaintenanceJob(log: { info: Function; error: Function }) {
	const result = await runGameLogMaintenance();
	log.info(
		{
			aggregatedFrom: result.aggregatedFrom,
			aggregatedTo: result.aggregatedTo,
			deletedTemporaryLogs: result.deletedTemporaryLogs,
			deletedHourlyLogs: result.deletedHourlyLogs
		},
		'[jobs] game-log-maintenance processed'
	);
}
