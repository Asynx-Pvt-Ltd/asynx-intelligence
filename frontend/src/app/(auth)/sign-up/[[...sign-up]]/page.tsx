import AuthWrapper from '@/src/features/auth/components/authWrapper';
import { SignUp } from '@clerk/nextjs';

export default function Page() {
	return (
		<AuthWrapper>
			<SignUp path="/sign-up" />;
		</AuthWrapper>
	);
}
