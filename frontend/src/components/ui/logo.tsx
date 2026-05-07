import Image from 'next/image';
import logo from '../../../public/logo.png';
import { cn } from '@/src/lib/utils';

const Logo = ({
	className,
	imageStyles,
}: {
	className?: string;
	imageStyles?: string;
}) => {
	return (
		<div className={cn(className)}>
			<Image src={logo} alt="logo" className={imageStyles} />
		</div>
	);
};

export default Logo;
