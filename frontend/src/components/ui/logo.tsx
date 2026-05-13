'use client';

import Image from 'next/image';
import logo from '../../../public/logo.png';
import { cn } from '@/src/lib/utils';
import { useRouter } from 'next/navigation';

const Logo = ({
	className,
	imageStyles,
	enableRedirect = false,
}: {
	className?: string;
	imageStyles?: string;
	enableRedirect?: boolean;
}) => {
	const router = useRouter();
	return (
		<div className={cn(className)}>
			<Image
				onClick={() => {
					if (enableRedirect) {
						router.push('/');
					}
				}}
				src={logo}
				alt="logo"
				className={imageStyles}
			/>
		</div>
	);
};

export default Logo;
