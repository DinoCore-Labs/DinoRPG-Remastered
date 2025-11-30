import { http } from '../utils/http';

export const UserService = {
	register(name: string, password: string) {
		return http()
			.post('/users/register', { name, password })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	login(name: string, password: string) {
		return http()
			.post('/users/login', { name, password })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	logout() {
		return http()
			.delete('/users/logout')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	me() {
		return http()
			.get('/users/me')
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				// 🔇 ne pas remonter l’erreur pour un 401
				if (err?.response?.status === 401) {
					return null;
				}
				// pour toute autre erreur, on remonte
				return Promise.reject(err);
			});
	}
};
