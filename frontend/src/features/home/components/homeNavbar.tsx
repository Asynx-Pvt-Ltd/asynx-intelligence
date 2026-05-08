import { cn } from '@/src/lib/utils';

interface HomeNavbarProps {
	className?: string;
	style?: React.CSSProperties;
}

const HomeNavbar = ({ className = '', style = {} }: HomeNavbarProps) => {
	return (
		<header
			className={cn(
				'flex h-16 items-center justify-between bg-background px-6',
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
