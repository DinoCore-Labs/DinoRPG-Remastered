function getRoleId(envKey: string): string | undefined {
	const roleId = process.env[envKey];
	if (!roleId) {
		console.warn(`[bot] Missing environment variable: ${envKey}`);
		return undefined;
	}
	return roleId;
}

export const XP_LEVELS = [
	{ xp: 0, role: getRoleId('ROLE_LVL0'), name: 'Joueur Débutant', emoji: '' },
	{ xp: 310, role: getRoleId('ROLE_LVL1'), name: 'Apprenti Dinoz', emoji: '' },
	{ xp: 800, role: getRoleId('ROLE_LVL2'), name: 'Joueur Confirmé', emoji: '' },
	{ xp: 2000, role: getRoleId('ROLE_LVL3'), name: 'Champion Dinoz', emoji: '⚡' },
	{ xp: 5000, role: getRoleId('ROLE_LVL4'), name: 'Joueur Expert', emoji: '' },
	{ xp: 7500, role: getRoleId('ROLE_LVL5'), name: 'Gardien Dinoz', emoji: '️' },
	{ xp: 10000, role: getRoleId('ROLE_LVL6'), name: 'Maître Dinoz', emoji: '' },
	{ xp: 15000, role: getRoleId('ROLE_LVL7'), name: 'Légende Dinoz', emoji: '' },
	{ xp: 22000, role: getRoleId('ROLE_LVL8'), name: 'Grand Protecteur Dinoz', emoji: '️' },
	{ xp: 30000, role: getRoleId('ROLE_LVL9'), name: 'Divinité Dinoz', emoji: '' }
];
