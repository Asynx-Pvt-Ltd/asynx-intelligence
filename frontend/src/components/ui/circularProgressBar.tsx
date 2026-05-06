import { UploadingFile } from '@/src/features/documents/components/documentUploader';
import { Check, Circle, X } from 'lucide-react';

function CircularProgress({
	progress,
	status,
}: {
	progress: number;
	status: UploadingFile['status'];
}) {
	const radius = 9;
	const stroke = 2;
	const normalizedRadius = radius - stroke / 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const offset =
		circumference -
		(Math.max(0, Math.min(progress, 100)) / 100) * circumference;

	if (status === 'uploaded') {
		return (
			<div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
				<Check className="h-3 w-3" />
			</div>
		);
	}

	if (status === 'error') {
		return (
			<div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white">
				<X className="h-3 w-3" />
			</div>
		);
	}

	return (
		<svg height="20" width="20" viewBox="0 0 20 20" className="shrink-0">
			<Circle
				stroke="currentColor"
				fill="transparent"
				strokeWidth={stroke}
				className="text-muted"
				r={normalizedRadius}
				cx="10"
				cy="10"
			/>
			<Circle
				stroke="currentColor"
				fill="transparent"
				strokeWidth={stroke}
				strokeLinecap="round"
				className="text-foreground transition-all"
				strokeDasharray={`${circumference} ${circumference}`}
				style={{ strokeDashoffset: offset }}
				r={normalizedRadius}
				cx="10"
				cy="10"
			/>
		</svg>
	);
}

export default CircularProgress;
