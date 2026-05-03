import { dinozStore } from '../store/dinozStore';
import { userStore } from '../store/userStore';

export function clearClientSession() {
	const uStore = userStore();
	const dStore = dinozStore();
	uStore.clearUser();
	dStore.clearDinoz();
	sessionStorage.removeItem('userStore');
	sessionStorage.removeItem('dinozStore');
}

let logoutInProgress = false;

export function startLogoutSession() {
	logoutInProgress = true;
}

export function stopLogoutSession() {
	logoutInProgress = false;
}

export function isLogoutSessionInProgress() {
	return logoutInProgress;
}
