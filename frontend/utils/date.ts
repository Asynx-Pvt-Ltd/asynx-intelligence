export function formatDate(date: Date | string) {
	return new Date(date).toLocaleDateString();
}

export function formatDateLong(date: Date | string) {
	return new Date(date).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function relativeTime(date: Date | string) {
	const diff = Date.now() - new Date(date).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	return `${days} day(s) ago`;
}
