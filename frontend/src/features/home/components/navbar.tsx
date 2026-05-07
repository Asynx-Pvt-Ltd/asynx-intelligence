import { cn } from '@/src/lib/utils';
import { useOrganization } from '@clerk/nextjs';

const Navbar = ({
	className = '',
	style = {},
}: {
	className?: string;
	style?: {};
}) => {
	const { organization } = useOrganization();
	return (
		<header
			className={cn(
				'flex h-16 items-center justify-end gap-2 bg-background px-4',
				className,
			)}
			style={style}
		>
			<h1 className="font-semibold text-xl">{organization?.name}</h1>
		</header>
	);
};

export default Navbar;
