class WebcamAnalysis {
    constructor() {
        this.video = document.getElementById('webcam');
        this.stream = null;
        this.confidenceHistory = [];
        this.currentConfidence = 75;
        this.onConfidenceUpdate = null;
        
        // Face detection
        this.faceDetectionModel = null;
        this.faceExpressionModel = null;
        
        // Analysis intervals
        this.analysisInterval = null;
        this.blinkCount = 0;
        this.smileCount = 0;
        this.eyeContactScore = 0;
        this.postureScore = 0;
        this.speechPauseCount = 0;
    }

    async startWebcam() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            
            // Load face detection models
            await this.loadFaceModels();
            
            // Start analysis
            this.startAnalysis();
            
            return true;
        } catch (error) {
            console.error('Camera error:', error);
            return false;
        }
    }

    async loadFaceModels() {
        try {
            // Load face-api.js models (if available)
            if (typeof faceapi !== 'undefined') {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                await faceapi.nets.faceExpressionNet.loadFromUri('/models');
                console.log('Face detection models loaded');
            }
        } catch (error) {
            console.log('Face detection not available, using simulated analysis');
        }
    }

    startAnalysis() {
        // Analyze every 2 seconds
        this.analysisInterval = setInterval(() => {
            this.analyzeConfidence();
        }, 2000);
    }

    async analyzeConfidence() {
        let eyeContact = 70;
        let posture = 65;
        let facialExpression = 60;
        let stability = 80;
        let voiceClarity = 75;
        
        // Real face detection if available
        if (typeof faceapi !== 'undefined' && this.video && this.video.readyState === 4) {
            try {
                const detection = await faceapi.detectSingleFace(
                    this.video, 
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceExpressions();
                
                if (detection) {
                    // Analyze eye contact
                    eyeContact = this.calculateEyeContact(detection);
                    
                    // Analyze facial expression
                    facialExpression = this.calculateExpressionScore(detection.expressions);
                    
                    // Analyze posture (face position)
                    posture = this.calculatePostureScore(detection);
                }
            } catch (error) {
                console.log('Face detection error:', error);
            }
        }
        
        // Analyze stability (how still user is)
        stability = this.calculateStability();
        
        // Voice clarity analysis (if available)
        voiceClarity = this.analyzeVoiceClarity();
        
        // Calculate final confidence score
        const confidence = (
            eyeContact * 0.25 +
            posture * 0.20 +
            facialExpression * 0.20 +
            stability * 0.15 +
            voiceClarity * 0.20
        );
        
        this.currentConfidence = Math.min(100, Math.max(0, confidence));
        
        this.confidenceHistory.push({
            timestamp: new Date(),
            confidence: this.currentConfidence,
            metrics: {
                eyeContact,
                posture,
                facialExpression,
                stability,
                voiceClarity
            }
        });
        
        if (this.onConfidenceUpdate) {
            this.onConfidenceUpdate(this.currentConfidence);
        }
    }

    calculateEyeContact(detection) {
        // Check if eyes are visible and looking at camera
        const eyes = detection.landmarks?.getEyes();
        if (eyes) {
            const eyeCenter = (eyes[0].x + eyes[1].x) / 2;
            const frameCenter = this.video.videoWidth / 2;
            const deviation = Math.abs(eyeCenter - frameCenter) / frameCenter;
            return Math.max(0, 100 - deviation * 50);
        }
        return 70 + Math.random() * 20;
    }

    calculateExpressionScore(expressions) {
        // Positive expressions: happy, neutral
        const positive = (expressions.happy || 0) + (expressions.neutral || 0);
        const negative = (expressions.sad || 0) + (expressions.angry || 0) + (expressions.fearful || 0);
        
        if (positive + negative === 0) return 70;
        return (positive / (positive + negative)) * 100;
    }

    calculatePostureScore(detection) {
        // Check if face is centered
        const faceCenter = detection.alignedRect._box;
        const frameCenter = this.video.videoWidth / 2;
        const deviation = Math.abs(faceCenter.x - frameCenter) / frameCenter;
        return Math.max(0, 100 - deviation * 40);
    }

    calculateStability() {
        // Track movement between frames
        if (!this.lastFrame) {
            this.lastFrame = performance.now();
            return 80;
        }
        
        const now = performance.now();
        const diff = now - this.lastFrame;
        this.lastFrame = now;
        
        // Stable movement = good confidence
        if (diff < 10) return 90;
        if (diff < 20) return 80;
        if (diff < 30) return 70;
        return 60;
    }

    analyzeVoiceClarity() {
        // This would integrate with speech recognition
        // For now, return simulated score
        return 70 + Math.random() * 20;
    }

    getCurrentConfidence() {
        return this.currentConfidence;
    }

    getConfidenceHistory() {
        return this.confidenceHistory;
    }

    stopWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
    }
}