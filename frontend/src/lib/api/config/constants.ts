// Shared infrastructure - Constants
// Application-wide constants

export const ROUTES = {
	// Public routes
	HOME: '/',
	LOGIN: '/auth/login',
	SIGNUP: '/auth/signup',

	// App routes
	APP: '/app',
	DASHBOARD: '/app',
	BILLING: '/app/billing',
	SETTINGS: '/app/settings',
	ANALYTICS: '/app/analytics',
} as const;

export const API_ROUTES = {
	AUTH_LOGIN: '/api/auth/login',
	AUTH_SIGNUP: '/api/auth/signup',
	AUTH_LOGOUT: '/api/auth/logout',
	USER_PROFILE: '/api/user/profile',
	BILLING_SUBSCRIPTION: '/api/billing/subscription',
} as const;

export const SUBSCRIPTION_PLANS = {
	FREE: { name: 'Free', price: 0, features: ['Basic features'] },
	PRO: {
		name: 'Pro',
		price: 49,
		features: ['All features', 'Priority support'],
	},
	ENTERPRISE: {
		name: 'Enterprise',
		price: 199,
		features: ['Custom everything'],
	},
} as const;
