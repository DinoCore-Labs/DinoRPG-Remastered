import axios from 'axios';
import type { ToastPluginApi } from 'vue-toast-notification';

import { getI18n } from '../i18n';

type BackendErrorPayload =
	| string
	| {
			message?: string;
			params?: Record<string, unknown>;
			error?: string;
			code?: string;
			errors?: Array<{ message?: string; code?: string; path?: string[] }>;
	  };

function extractBackendCode(data: BackendErrorPayload): string | null {
	if (!data) return null;
	if (typeof data === 'string') return data;
	if (typeof data.code === 'string') return data.code;
	if (typeof data.error === 'string') return data.error;
	if (typeof data.message === 'string') return data.message;
	const first = Array.isArray(data.errors) ? data.errors[0] : null;
	if (typeof first?.code === 'string') return first.code;
	if (typeof first?.message === 'string') return first.message;
	return null;
}

function extractBackendParams(data: BackendErrorPayload): Record<string, unknown> | undefined {
	if (!data || typeof data === 'string') return undefined;
	if (data.params && typeof data.params === 'object') {
		return data.params;
	}
	return undefined;
}

function normalizeToastKey(code: string): string {
	return code.startsWith('toast.') ? code : `toast.${code}`;
}

type I18nGlobalTranslator = {
	t: (key: string, params?: Record<string, unknown>) => string;
	te: (key: string) => boolean;
};

function translateToast(code: string, params?: Record<string, unknown>): string {
	const global = getI18n().global as unknown as I18nGlobalTranslator;
	const key = normalizeToastKey(code);
	if (global.te(key)) {
		return global.t(key, params ?? {});
	}
	return global.t('toast.unknown');
}

export const errorHandler = {
	handle(err: unknown, toast: ToastPluginApi): void {
		if (axios.isAxiosError(err)) {
			const status = err.response?.status;
			const data = err.response?.data as BackendErrorPayload | undefined;
			const code = data ? extractBackendCode(data) : null;
			const params = data ? extractBackendParams(data) : undefined;
			if (code) {
				toast.open({
					message: translateToast(code, params),
					type: 'error'
				});
				return;
			}
			toast.open({
				message: status ? `HTTP ${status}` : translateToast('unknown'),
				type: 'error'
			});
			return;
		}
		if (err instanceof Error) {
			toast.open({
				message: err.message,
				type: 'error'
			});
			return;
		}
		if (typeof err === 'string') {
			toast.open({
				message: translateToast(err),
				type: 'error'
			});
			return;
		}
		toast.open({
			message: translateToast('unknown'),
			type: 'error'
		});
	}
};
