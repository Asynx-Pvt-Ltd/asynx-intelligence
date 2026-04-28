import { OrganizationSwitcher } from '@clerk/nextjs';
import SignOutButton from './signOutButton';
import { ThemeToggle } from '@/src/components/ui/themeToggle';

const Navbar = () => {
	return (
		<div className="flex justify-end gap-2 py-3 border">
			<ThemeToggle />
			<SignOutButton />
			<OrganizationSwitcher />
		</div>
	);
};

export default Navbar;
