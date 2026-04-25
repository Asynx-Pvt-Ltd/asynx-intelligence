// Shared infrastructure - App configuration
// Environment-aware configuration

export const appConfig = {
	name: 'Your SaaS',
	description: 'Production-ready SaaS template',
	url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	api: {
		baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
	},
	features: {
		auth: true,
		billing: true,
		analytics: true,
	},
} as const;

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
