class SpeechRecognitionService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.onTranscriptUpdate = null;
        this.onFinalTranscript = null;
        
        this.initRecognition();
    }

    initRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.error('Speech recognition not supported');
            return;
        }

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            this.interimTranscript = '';
            this.finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript;
                    if (this.onFinalTranscript) {
                        this.onFinalTranscript(this.finalTranscript);
                    }
                } else {
                    this.interimTranscript += transcript;
                }
            }

            if (this.onTranscriptUpdate) {
                this.onTranscriptUpdate(this.finalTranscript, this.interimTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                this.startListening();
            }
        };
    }

    startListening() {
        if (!this.recognition) return;
        
        try {
            this.recognition.start();
            this.isListening = true;
            console.log('Started listening...');
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }

    stopListening() {
        if (!this.recognition) return;
        
        try {
            this.recognition.stop();
            this.isListening = false;
            console.log('Stopped listening');
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }

    reset() {
        this.finalTranscript = '';
        this.interimTranscript = '';
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate('', '');
        }
    }
}

class TextToSpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.utterance = null;
        this.onStart = null;
        this.onEnd = null;
    }

    speak(text) {
        if (!this.synthesis) {
            console.error('Speech synthesis not supported');
            return;
        }

        this.stop();

        this.utterance = new SpeechSynthesisUtterance(text);
        
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Female')
        );
        
        if (preferredVoice) {
            this.utterance.voice = preferredVoice;
        }

        this.utterance.rate = 1;
        this.utterance.pitch = 1;
        this.utterance.volume = 1;

        this.utterance.onstart = () => {
            console.log('Speech started');
            if (this.onStart) this.onStart();
        };

        this.utterance.onend = () => {
            console.log('Speech ended');
            if (this.onEnd) this.onEnd();
        };

        this.utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            if (this.onEnd) this.onEnd();
        };

        this.synthesis.speak(this.utterance);
    }

    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
}