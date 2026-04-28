import { Button } from '@/src/components/ui/button';
import { SignOutButton as SignOut } from '@clerk/nextjs';

const SignOutButton = () => {
	return (
		<SignOut>
			<Button variant="destructive" size="sm">
				Sign Out
			</Button>
		</SignOut>
	);
};

export default SignOutButton;
