const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION;

const VERSION_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 heures
const MIN_DELAY_BETWEEN_CHECKS = 5 * 60 * 1000; // anti-spam focus / visibility

const LAST_RELOAD_VERSION_KEY = 'dinorpg:last-reload-version';

let versionCheckInterval: ReturnType<typeof setInterval> | null = null;
let lastVersionCheck = 0;
let isCheckingVersion = false;

async function checkVersion(force = false): Promise<void> {
	if (import.meta.env.DEV) {
		return;
	}
	const now = Date.now();
	if (isCheckingVersion) {
		return;
	}
	if (!force && now - lastVersionCheck < MIN_DELAY_BETWEEN_CHECKS) {
		return;
	}
	isCheckingVersion = true;
	lastVersionCheck = now;
	try {
		const response = await fetch(`/api/version?t=${now}`, {
			cache: 'no-store',
			headers: {
				'Cache-Control': 'no-cache'
			}
		});
		if (!response.ok) {
			return;
		}
		const data = (await response.json()) as { version?: string };
		if (!data.version || data.version === CURRENT_VERSION) {
			return;
		}
		const lastReloadVersion = localStorage.getItem(LAST_RELOAD_VERSION_KEY);
		if (lastReloadVersion === data.version) {
			return;
		}
		localStorage.setItem(LAST_RELOAD_VERSION_KEY, data.version);
		window.location.reload();
	} catch {
		// On ignore volontairement pour ne jamais casser le jeu.
	} finally {
		isCheckingVersion = false;
	}
}

export function startVersionChecker(): void {
	if (import.meta.env.DEV) {
		return;
	}
	void checkVersion(true);
	versionCheckInterval = setInterval(() => {
		void checkVersion();
	}, VERSION_CHECK_INTERVAL);
	window.addEventListener('focus', () => {
		void checkVersion();
	});
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) {
			void checkVersion();
		}
	});
}

export function stopVersionChecker(): void {
	if (!versionCheckInterval) {
		return;
	}
	clearInterval(versionCheckInterval);
	versionCheckInterval = null;
}
