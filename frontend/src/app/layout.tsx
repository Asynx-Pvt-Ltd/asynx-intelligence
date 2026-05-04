import { cn } from '@/src/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { Noto_Sans, Playfair_Display } from 'next/font/google';
import type React from 'react';
import { ThemeProvider } from '../components/providers/themeProvider';
import './globals.css';

const playfairDisplayHeading = Playfair_Display({
	subsets: ['latin'],
	variable: '--font-heading',
});

const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
	title: 'Enterprice AI Chatbot',
	description: 'AI Chatbot for pdf analysis',
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
				className={cn(
					'font-sans',
					notoSans.variable,
					playfairDisplayHeading.variable,
				)}
				suppressHydrationWarning
			>
				<body>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
