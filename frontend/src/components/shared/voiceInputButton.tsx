'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

type VoiceInputButtonProps = {
	onTranscript: (text: string) => void;
	disabled?: boolean;
	className?: string;
	showLabel?: boolean;
};

export function VoiceInputButton({
	onTranscript,
	disabled = false,
	className,
	showLabel = true,
}: VoiceInputButtonProps) {
	const [isRecording, setIsRecording] = useState(false);
	const [isSupported, setIsSupported] = useState(true);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const SpeechRecognitionCtor =
			(window as any).SpeechRecognition ||
			(window as any).webkitSpeechRecognition;

		if (!SpeechRecognitionCtor) {
			console.warn(
				'Web Speech API: SpeechRecognition not supported in this browser',
			);
			setIsSupported(false);
			recognitionRef.current = null;
			return;
		}

		const recognition = new SpeechRecognitionCtor() as SpeechRecognition;
		recognition.lang = 'en-US';
		recognition.continuous = false;
		recognition.interimResults = true;

		recognition.onstart = () => {
			console.log('Speech recognition started');
		};

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			console.log('onresult fired', event);

			let finalTranscript = '';
			let interimTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const res = event.results[i];
				if (res.isFinal) {
					finalTranscript += res[0].transcript;
				} else {
					interimTranscript += res[0].transcript;
				}
			}

			const text = finalTranscript || interimTranscript;
			if (text) {
				console.log('Transcript:', text);
				onTranscript(text);
			}
		};

		recognition.onerror = (e: any) => {
			console.error('Speech recognition error', e);
			setIsRecording(false);
		};

		recognition.onend = () => {
			console.log('Speech recognition ended');
			setIsRecording(false);
		};

		recognitionRef.current = recognition;

		return () => {
			recognition.stop();
			recognitionRef.current = null;
		};
	}, [onTranscript]);

	const toggleRecording = () => {
		const recognition = recognitionRef.current;
		if (!recognition || disabled || !isSupported) {
			console.warn('Cannot start recognition: not supported or disabled');
			return;
		}

		if (!isRecording) {
			try {
				console.log('Calling recognition.start()');
				recognition.start();
				setIsRecording(true);
			} catch (err) {
				console.error('Error starting recognition', err);
			}
		} else {
			console.log('Calling recognition.stop()');
			recognition.stop();
			setIsRecording(false);
		}
	};

	const effectiveDisabled = disabled || !isSupported || !recognitionRef.current;

	return (
		<div className="flex items-center gap-1">
			<Button
				type="button"
				size="icon"
				onClick={toggleRecording}
				disabled={effectiveDisabled}
				className={cn(
					'h-10 w-10 rounded-full',
					isRecording ? 'bg-red-500 text-white hover:bg-red-500/90' : '',
					className,
				)}
			>
				{isRecording ? (
					<MicOff className="h-4 w-4" />
				) : (
					<Mic className="h-4 w-4" />
				)}
			</Button>

			{showLabel && (
				<span className="text-[11px] sm:text-xs text-muted-foreground">
					{isSupported
						? isRecording
							? 'Listening…'
							: 'Voice'
						: 'No mic support'}
				</span>
			)}
		</div>
	);
}
