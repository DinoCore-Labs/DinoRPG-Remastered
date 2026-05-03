// app/client/src/utils/versionChecker.ts
const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION;

export function startVersionChecker(): void {
	if (import.meta.env.DEV) {
		return;
	}
	const check = async () => {
		try {
			const response = await fetch(`/api/version?t=${Date.now()}`, {
				cache: 'no-store'
			});

			if (!response.ok) {
				return;
			}

			const data = await response.json();

			if (data.version && data.version !== CURRENT_VERSION) {
				window.location.reload();
			}
		} catch {
			// On ignore volontairement pour ne jamais casser le jeu.
		}
	};
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) {
			void check();
		}
	});
	setInterval(() => {
		void check();
	}, 60_000);
}
