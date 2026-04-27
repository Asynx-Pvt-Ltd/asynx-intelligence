import { ClerkProvider } from '@clerk/nextjs';
import type React from 'react';
import './globals.css';

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
			<html lang="en">
				<body>{children}</body>
			</html>
		</ClerkProvider>
	);
}
