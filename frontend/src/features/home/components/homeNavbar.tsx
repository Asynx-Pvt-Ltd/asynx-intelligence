'use client';

import { cn } from '@/src/lib/utils';
import { usePathname } from 'next/navigation';

interface HomeNavbarProps {
	className?: string;
	style?: React.CSSProperties;
}

const HomeNavbar = ({ className = '', style = {} }: HomeNavbarProps) => {
	const pathname = usePathname();

	return (
		<header
			className={cn(
				'flex h-16 items-center justify-between bg-background px-6 border-b border-border',
				className,
			)}
			style={style}
		>
			<div className="flex items-center gap-4">
				<nav className="hidden md:flex items-center gap-1 ml-8"></nav>
			</div>
		</header>
	);
};

export default HomeNavbar;
