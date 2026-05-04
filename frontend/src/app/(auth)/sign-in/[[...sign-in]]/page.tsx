import AuthWrapper from '@/src/features/auth/components/authWrapper';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
	return (
		<AuthWrapper>
			<SignIn path="/sign-in" />
		</AuthWrapper>
	);
}
