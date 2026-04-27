import Link from 'next/link';
import Navbar from './navbar';

export function LandingPageContent() {
	return (
		<main className="min-h-screen">
			<Navbar />
			<section className="container mx-auto px-6 py-20 text-center">
				<h1 className="text-5xl font-bold mb-6">
					Welcome to Your SaaS Platform
				</h1>
				<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
					Built with a scalable, production-ready architecture
				</p>
				<div className="flex gap-4 justify-center">
					<Link
						href={'/'}
						className="px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90"
					>
						Get Started
					</Link>
					<Link
						href={'/'}
						className="px-6 py-3 border rounded-md hover:bg-muted"
					>
						Sign In
					</Link>
				</div>
			</section>
		</main>
	);
}
