import Link from 'next/link';
import { ROUTES } from '@/src/shared/constants/routes';

export function LoginPageContent() {
	return (
		<main className="min-h-screen flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<h1 className="text-3xl font-bold mb-2 text-center">Sign In</h1>
				<p className="text-muted-foreground text-center mb-8">
					Enter your credentials to access your account
				</p>

				<div className="border rounded-lg p-8">
					<form className="space-y-6">
						<div>
							<label className="block text-sm font-medium mb-2">Email Address</label>
							<input
								type="email"
								className="w-full px-4 py-2 border rounded-md"
								placeholder="you@example.com"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Password</label>
							<input
								type="password"
								className="w-full px-4 py-2 border rounded-md"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							className="w-full bg-foreground text-background py-3 rounded-md hover:opacity-90 font-medium"
						>
							Sign In
						</button>
					</form>

					<p className="text-center text-sm text-muted-foreground mt-6">
						Don't have an account?{' '}
						<Link href={ROUTES.SIGNUP} className="underline">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}
