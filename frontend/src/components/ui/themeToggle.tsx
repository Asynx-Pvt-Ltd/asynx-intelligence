'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon">
				<Sun className="h-5 w-5" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon-lg"
			title="Toggle Theme"
			onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
			aria-label="Toggle theme"
			className={cn('', className)}
		>
			{resolvedTheme === 'dark' ? (
				<Sun className="h-5! w-5!" />
			) : (
				<Moon className="h-5! w-5!" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
