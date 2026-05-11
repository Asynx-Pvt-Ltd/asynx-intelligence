interface SpeechRecognition extends EventTarget {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onerror: ((event: Event) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
}

interface SpeechRecognitionResult {
	readonly isFinal: boolean;
	readonly length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	readonly transcript: string;
	readonly confidence: number;
}

interface SpeechRecognitionResultList {
	readonly length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
	readonly resultIndex: number;
	readonly results: SpeechRecognitionResultList;
}

interface Window {
	SpeechRecognition?: {
		new (): SpeechRecognition;
	};
	webkitSpeechRecognition?: {
		new (): SpeechRecognition;
	};
}
