import axios from 'axios';
import type { ToastPluginApi } from 'vue-toast-notification';

type Translator = (key: string, params?: Record<string, unknown>) => string;

type BackendErrorPayload =
	| string
	| {
			message?: string; // ExpectedError / handler backend
			params?: Record<string, unknown>;
			error?: string;
			code?: string;
			errors?: Array<{ message?: string; code?: string; path?: string[] }>;
	  };

function extractBackendCode(data: BackendErrorPayload): string | null {
	if (!data) return null;
	if (typeof data === 'string') return data;

	if (typeof data.message === 'string') return data.message;
	if (typeof data.code === 'string') return data.code;
	if (typeof data.error === 'string') return data.error;

	const first = Array.isArray(data.errors) ? data.errors[0] : null;
	if (typeof first?.message === 'string') return first.message;
	if (typeof first?.code === 'string') return first.code;

	return null;
}

function extractBackendParams(data: BackendErrorPayload): Record<string, unknown> | undefined {
	if (!data || typeof data === 'string') return undefined;

	// ton ExpectedError renverra { message, params }
	if (data.params && typeof data.params === 'object') return data.params;

	// validation: si tu veux passer des infos, tu peux aussi les map ici plus tard
	return undefined;
}

function translate(t: Translator | undefined, key: string, params?: Record<string, unknown>): string {
	if (!t) return key;
	return t(`toast.${key}`, params); // <-- tu utilises toast.<key>
}

export const errorHandler = {
	handle(err: unknown, toast: ToastPluginApi, t?: Translator): void {
		// 1) Erreurs BACK (Axios)
		if (axios.isAxiosError(err)) {
			const status = err.response?.status;
			const data = err.response?.data as BackendErrorPayload | undefined;

			const code = data ? extractBackendCode(data) : null;
			const params = data ? extractBackendParams(data) : undefined;

			if (code) {
				toast.open({ message: translate(t, code, params), type: 'error' });
				return;
			}

			// fallback (évite [object Object])
			const fallback = (status ? `HTTP ${status}` : null) ?? (err.message || 'Unknown error');
			toast.open({ message: fallback, type: 'error' });
			return;
		}

		// 2) Erreurs FRONT
		if (err instanceof Error) {
			// option: si tu veux traduire aussi certaines erreurs front, décommente:
			// toast.open({ message: translate(t, err.message), type: 'error' });
			toast.open({ message: err.message, type: 'error' });
			return;
		}

		// 3) Strings / unknown
		if (typeof err === 'string') {
			toast.open({ message: err, type: 'error' });
			return;
		}

		toast.open({ message: t ? t('toast.unknownError') : 'Unknown error', type: 'error' });
	}
};
