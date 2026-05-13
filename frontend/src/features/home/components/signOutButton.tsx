import { SignOutButton as SignOut } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const SignOutButton = () => {
	return (
		<SignOut>
			<button
				aria-label="Sign out"
				className={cn(
					'flex h-8 w-8 items-center justify-center rounded-lg',
					'text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10',
					'transition-colors duration-150',
				)}
			>
				<LogOut className="h-4 w-4" />
			</button>
		</SignOut>
	);
};

export default SignOutButton;
