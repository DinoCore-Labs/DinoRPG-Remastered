function formatDateTime(date: string | Date) {
	return new Date(date).toLocaleString('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatDate(date: string | Date) {
	return new Date(date).toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
}

export { formatDate, formatDateTime };
