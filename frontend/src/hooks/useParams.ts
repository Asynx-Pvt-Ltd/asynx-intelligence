import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useParams = () => {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	return {
		router,
		pathname,
		params,
	};
};
