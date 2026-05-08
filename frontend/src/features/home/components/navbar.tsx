'use client';

import { cn } from '@/src/lib/utils';

const Navbar = ({
	className = '',
	style = {},
}: {
	className?: string;
	style?: {};
}) => {
	return (
		<header
			className={cn(
				'flex h-16 items-center justify-end gap-2 bg-background px-4',
				className,
			)}
			style={style}
		></header>
	);
};

export default Navbar;
