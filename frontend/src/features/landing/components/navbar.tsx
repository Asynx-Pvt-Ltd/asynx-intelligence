import { OrganizationSwitcher } from '@clerk/nextjs';

const Navbar = () => {
	return (
		<div className="flex justify-end">
			<OrganizationSwitcher />
		</div>
	);
};

export default Navbar;
