import { OrganizationSwitcher } from '@clerk/nextjs';
import SignOutButton from './signOutButton';
import { ThemeToggle } from '@/src/components/ui/themeToggle';
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
				'flex h-16 items-center justify-end gap-2 border-b bg-background px-4',
				className,
			)}
			style={style}
		>
			<ThemeToggle />
			<SignOutButton />
			<OrganizationSwitcher />
		</header>
	);
};

export default Navbar;
