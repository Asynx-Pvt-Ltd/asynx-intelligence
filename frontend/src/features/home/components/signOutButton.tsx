import { Button } from '@/src/components/ui/button';
import { SignOutButton as SignOut } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

const SignOutButton = () => {
	return (
		<SignOut>
			<Button size={'icon'} variant="destructive">
				<LogOut />
			</Button>
		</SignOut>
	);
};

export default SignOutButton;
