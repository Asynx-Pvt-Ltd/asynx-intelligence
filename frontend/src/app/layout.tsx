import { cn } from '@/src/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import type React from 'react';
import { ThemeProvider } from '../components/providers/themeProvider';
import './globals.css';

const geist = Geist({
	subsets: ['latin'],
	variable: '--font-geist',
	display: 'swap',
});

const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
	display: 'swap',
});

export const metadata = {
	title: 'Aria — AI Assistant',
	description: 'Your intelligent work assistant by Asynx Engineering',
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html
				lang="en"
				className={cn(geist.variable, geistMono.variable)}
				suppressHydrationWarning
			>
				<body className="font-sans antialiased">
					<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
