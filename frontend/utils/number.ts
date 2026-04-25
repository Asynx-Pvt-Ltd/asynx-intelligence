export function formatCurrency(value: number, currency: string = 'USD') {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency,
	}).format(value);
}
