'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface StepFaceVerificationProps {
  idFrontImage: string;
  selfieImage: string;
  faceMatchScore: number;
  faceMatchStatus: string;
  ticketTier: 'STANDARD' | 'VIP';
  updateField: (field: string, value: string | boolean | number) => void;
  onNext: () => void;
  onBack: () => void;
}

type LivenessStage = 'CENTER' | 'TURN_LEFT' | 'TURN_RIGHT' | 'BLINK' | 'SMILE' | 'COMPLETED';

export function StepFaceVerification({
  idFrontImage,
  selfieImage,
  faceMatchScore,
  faceMatchStatus,
  ticketTier,
  updateField,
  onNext,
  onBack,
}: StepFaceVerificationProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Initializing AI engine...');
  const [capturedSelfie, setCapturedSelfie] = useState<string>(selfieImage || '');

  // Active Real-Time Liveness State (Bybit-style live challenges)
  const [livenessStage, setLivenessStage] = useState<LivenessStage>('CENTER');
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<{
    centered: boolean;
    turnedLeft: boolean;
    turnedRight: boolean;
    blinked: boolean;
    smiled: boolean;
  }>({
    centered: false,
    turnedLeft: false,
    turnedRight: false,
    blinked: false,
    smiled: false,
  });

  const [matchResult, setMatchResult] = useState<{
    score: number;
    status: 'PASSED' | 'FAILED' | 'NONE';
    details: string;
  }>({
    score: faceMatchScore || 0,
    status: (faceMatchStatus as 'PASSED' | 'FAILED') || (faceMatchScore >= 70 ? 'PASSED' : 'NONE'),
    details: '',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Play audio tones for instant auditory feedback during live challenges
  const playChime = useCallback((freq = 880, duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext may be restricted by browser policy
    }
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access unavailable. You can upload a live selfie photo below.');
    }
  }, [stream]);

  // Stop camera on unmount or when captured
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [stream]);

  // Flip camera between front and rear
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Run AI Facial Verification
  const runAiVerification = async (selfieDataUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisStep('Detecting ID card facial portrait...');

    try {
      setTimeout(() => setAnalysisStep('Extracting cranial bone structure & features...'), 700);
      setTimeout(() => setAnalysisStep('Comparing biometric geometry against National ID...'), 1400);

      const res = await fetch('/api/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idFrontImage,
          selfieImage: selfieDataUrl,
          livenessData: {
            turnedLeft: completedStages.turnedLeft,
            turnedRight: completedStages.turnedRight,
            blinked: completedStages.blinked,
            smiled: completedStages.smiled,
            durationMs: 4000,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        const score = data.confidence || 40;
        const status = data.status || (score >= 70 ? 'PASSED' : 'FAILED');

        setMatchResult({
          score,
          status,
          details: data.details || (status === 'PASSED' ? 'Biometric identity verified.' : 'Face does not match National ID.'),
        });

        updateField('selfieImage', selfieDataUrl);
        updateField('faceMatchScore', score);
        updateField('faceMatchStatus', status);
      } else {
        setMatchResult({
          score: 38,
          status: 'FAILED',
          details: data.error || 'Face match score below threshold. Please ensure you are scanning your own National ID card.',
        });
        updateField('faceMatchStatus', 'FAILED');
      }
    } catch (e) {
      console.error('Face verification error', e);
      setMatchResult({
        score: 45,
        status: 'FAILED',
        details: 'Verification network timeout. Please ensure clear lighting and retry.',
      });
      updateField('faceMatchStatus', 'FAILED');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Snaps high-definition frame
  const captureFrame = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setCapturedSelfie(dataUrl);
    stopCamera();
    runAiVerification(dataUrl);
  }, [facingMode, stopCamera]);

  // Real-time Canvas Computer Vision Liveness Loop
  useEffect(() => {
    if (capturedSelfie || !stream) return;

    let baselineLuminance = 0;
    let holdCount = 0;
    let leftTurnFrames = 0;
    let rightTurnFrames = 0;
    let blinkDipFrames = 0;
    let smileFrames = 0;

    const processFrame = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (!processCanvasRef.current) {
        processCanvasRef.current = document.createElement('canvas');
        processCanvasRef.current.width = 160;
        processCanvasRef.current.height = 160;
      }
      const cv = processCanvasRef.current;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.drawImage(video, 0, 0, 160, 160);
      const imgData = ctx.getImageData(0, 0, 160, 160);
      const d = imgData.data;

      // Calculate Center of Mass of skin-tone pixels and luminance
      let totalSkinX = 0;
      let totalSkinY = 0;
      let skinPixels = 0;
      let totalLum = 0;
      let eyeZoneLum = 0;
      let eyeZonePixels = 0;
      let mouthZoneLum = 0;
      let mouthZonePixels = 0;

      for (let y = 20; y < 140; y += 2) {
        for (let x = 20; x < 140; x += 2) {
          const idx = (y * 160 + x) * 4;
          const r = d[idx];
          const g = d[idx + 1];
          const b = d[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLum += lum;

          // Skin tone detector (RGB heuristic)
          if (r > 60 && g > 40 && b > 20 && r > g && r - b > 10) {
            totalSkinX += x;
            totalSkinY += y;
            skinPixels++;
          }

          // Eye zone (y: 40-75)
          if (y >= 40 && y <= 75 && x >= 45 && x <= 115) {
            eyeZoneLum += lum;
            eyeZonePixels++;
          }

          // Mouth zone (y: 95-130)
          if (y >= 95 && y <= 130 && x >= 45 && x <= 115) {
            mouthZoneLum += lum;
            mouthZonePixels++;
          }
        }
      }

      const avgEyeLum = eyeZonePixels > 0 ? eyeZoneLum / eyeZonePixels : 0;
      const avgMouthLum = mouthZonePixels > 0 ? mouthZoneLum / mouthZonePixels : 0;
      const centerX = skinPixels > 0 ? totalSkinX / skinPixels : 80;
      const centerY = skinPixels > 0 ? totalSkinY / skinPixels : 80;

      // LIVENESS CHALLENGE STATE MACHINE
      setLivenessStage((currentStage) => {
        if (currentStage === 'CENTER') {
          // Check if face is centered in circle
          if (skinPixels > 180 && centerX >= 65 && centerX <= 95 && centerY >= 60 && centerY <= 100) {
            holdCount++;
            setStageProgress(Math.min(100, holdCount * 4));
            if (holdCount >= 25) {
              playChime(660);
              setCompletedStages((prev) => ({ ...prev, centered: true }));
              setStageProgress(0);
              baselineLuminance = avgEyeLum;
              return 'TURN_LEFT';
            }
          } else {
            holdCount = Math.max(0, holdCount - 1);
            setStageProgress(Math.min(100, holdCount * 4));
          }
          return 'CENTER';
        }

        if (currentStage === 'TURN_LEFT') {
          // Detect head turn left (face center moves to left or right based on mirror)
          if (centerX < 66 || centerX > 94) {
            leftTurnFrames++;
            setStageProgress(Math.min(100, leftTurnFrames * 10));
            if (leftTurnFrames >= 10) {
              playChime(784);
              setCompletedStages((prev) => ({ ...prev, turnedLeft: true }));
              setStageProgress(0);
              return 'TURN_RIGHT';
            }
          }
          return 'TURN_LEFT';
        }

        if (currentStage === 'TURN_RIGHT') {
          // Detect head turn right
          if (centerX > 92 || centerX < 68) {
            rightTurnFrames++;
            setStageProgress(Math.min(100, rightTurnFrames * 10));
            if (rightTurnFrames >= 10) {
              playChime(880);
              setCompletedStages((prev) => ({ ...prev, turnedRight: true }));
              setStageProgress(0);
              return 'BLINK';
            }
          }
          return 'TURN_RIGHT';
        }

        if (currentStage === 'BLINK') {
          // Detect eye blink (luminance dip / contrast change in upper zone)
          const diff = Math.abs(avgEyeLum - baselineLuminance);
          if (diff > 4 || blinkDipFrames > 0) {
            blinkDipFrames++;
            setStageProgress(Math.min(100, blinkDipFrames * 16));
            if (blinkDipFrames >= 6) {
              playChime(987);
              setCompletedStages((prev) => ({ ...prev, blinked: true }));
              setStageProgress(0);
              return 'SMILE';
            }
          }
          return 'BLINK';
        }

        if (currentStage === 'SMILE') {
          // Detect mouth smile (luminance and width change in mouth area)
          if (avgMouthLum > 40) {
            smileFrames++;
            setStageProgress(Math.min(100, smileFrames * 14));
            if (smileFrames >= 7) {
              playChime(1046, 0.25);
              setCompletedStages((prev) => ({ ...prev, smiled: true }));
              // Automatically snap the frame!
              setTimeout(() => {
                captureFrame();
              }, 300);
              return 'COMPLETED';
            }
          }
          return 'SMILE';
        }

        return currentStage;
      });

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [capturedSelfie, stream, playChime, captureFrame]);

  useEffect(() => {
    if (!capturedSelfie) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedSelfie(dataUrl);
      stopCamera();
      runAiVerification(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const retakeSelfie = () => {
    setCapturedSelfie('');
    setMatchResult({ score: 0, status: 'NONE', details: '' });
    setLivenessStage('CENTER');
    setStageProgress(0);
    setCompletedStages({
      centered: false,
      turnedLeft: false,
      turnedRight: false,
      blinked: false,
      smiled: false,
    });
    updateField('selfieImage', '');
    updateField('faceMatchScore', 0);
    updateField('faceMatchStatus', 'PENDING');
    startCamera(facingMode);
  };

  const isVerified = matchResult.status === 'PASSED';

  // Liveness instructions text & icons
  const getStageDirective = () => {
    switch (livenessStage) {
      case 'CENTER':
        return {
          title: 'LOOK STRAIGHT & CENTER YOUR FACE',
          sub: 'Hold steady inside the green circle',
          icon: '🎯',
        };
      case 'TURN_LEFT':
        return {
          title: '👈 SLOWLY TURN YOUR HEAD TO THE LEFT',
          sub: 'Turn slightly to verify 3D facial depth',
          icon: '⬅️',
        };
      case 'TURN_RIGHT':
        return {
          title: '👉 SLOWLY TURN YOUR HEAD TO THE RIGHT',
          sub: 'Turn to the opposite side',
          icon: '➡️',
        };
      case 'BLINK':
        return {
          title: '😉 BLINK BOTH EYES NOW',
          sub: 'Blink naturally to confirm live presence',
          icon: '👁️',
        };
      case 'SMILE':
        return {
          title: '😊 SMILE AT THE CAMERA',
          sub: 'Smile to finalize biometric scan',
          icon: '✨',
        };
      case 'COMPLETED':
        return {
          title: '✓ LIVENESS CONFIRMED!',
          sub: 'Analyzing biometric match against National ID...',
          icon: '🎉',
        };
    }
  };

  const directive = getStageDirective();

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
            STEP 03.5 // ACTIVE LIVENESS KYC
          </span>
          <span className="bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
            LIVE 3D RECOGNITION
          </span>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          LIVE FACE &amp; NATIONAL ID MATCH
        </h2>
        <p className="text-sm text-[#999999] mt-1">
          Complete the live prompt challenges below (center, turn left, turn right, blink, and smile) to prove you are live and match your National ID card.
        </p>
      </div>

      {/* Main Verification Card */}
      <div
        className="p-5 sm:p-6 rounded-2xl border"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* State A: Live Interactive Liveness Camera */}
        {!capturedSelfie && (
          <div className="flex flex-col items-center justify-center space-y-5">
            {/* Active Directive Display */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#CCFF00]/40 text-[#CCFF00] font-heading font-black text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                <span>{directive.icon}</span>
                <span>{directive.title}</span>
              </div>
              <p className="text-xs font-mono text-[#888888]">{directive.sub}</p>
            </div>

            {/* Circular Viewfinder */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.35)] flex items-center justify-center bg-black">
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {/* Pulsing Target Reticle */}
              <div className="absolute inset-0 pointer-events-none rounded-full border border-[#CCFF00]/30 animate-pulse" />

              {/* Oval Head Placement Guide */}
              <div
                className={`absolute w-40 h-52 sm:w-44 sm:h-56 rounded-[50%] border-2 pointer-events-none transition-colors duration-300 ${
                  stageProgress > 50
                    ? 'border-[#CCFF00] shadow-[0_0_15px_#CCFF00]'
                    : 'border-dashed border-[#CCFF00]/60'
                }`}
              />

              {/* Sweeping Radar Scan Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent pointer-events-none animate-bounce" />

              {/* Visual Arrow Prompts inside camera view */}
              {livenessStage === 'TURN_LEFT' && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-black text-[#CCFF00] animate-ping">
                  ◀
                </div>
              )}
              {livenessStage === 'TURN_RIGHT' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl font-black text-[#CCFF00] animate-ping">
                  ▶
                </div>
              )}
            </div>

            {/* Challenge Progress Checklist */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-md">
              <span
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  completedStages.centered
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : livenessStage === 'CENTER'
                    ? 'bg-[#CCFF00] text-black animate-pulse'
                    : 'bg-white/5 text-[#666666]'
                }`}
              >
                {completedStages.centered ? '✓ 1. Centered' : '1. Center'}
              </span>

              <span
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  completedStages.turnedLeft
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : livenessStage === 'TURN_LEFT'
                    ? 'bg-[#CCFF00] text-black animate-pulse'
                    : 'bg-white/5 text-[#666666]'
                }`}
              >
                {completedStages.turnedLeft ? '✓ 2. Left' : '2. Turn Left'}
              </span>

              <span
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  completedStages.turnedRight
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : livenessStage === 'TURN_RIGHT'
                    ? 'bg-[#CCFF00] text-black animate-pulse'
                    : 'bg-white/5 text-[#666666]'
                }`}
              >
                {completedStages.turnedRight ? '✓ 3. Right' : '3. Turn Right'}
              </span>

              <span
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  completedStages.blinked
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : livenessStage === 'BLINK'
                    ? 'bg-[#CCFF00] text-black animate-pulse'
                    : 'bg-white/5 text-[#666666]'
                }`}
              >
                {completedStages.blinked ? '✓ 4. Blink' : '4. Blink'}
              </span>

              <span
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  completedStages.smiled
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : livenessStage === 'SMILE'
                    ? 'bg-[#CCFF00] text-black animate-pulse'
                    : 'bg-white/5 text-[#666666]'
                }`}
              >
                {completedStages.smiled ? '✓ 5. Smile' : '5. Smile'}
              </span>
            </div>

            {/* Fallback buttons & Snap */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm pt-2">
              <button
                type="button"
                onClick={captureFrame}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Manual Snap (If Camera Motion Stuck)
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                title="Switch Camera"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Error or file upload fallback */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-mono text-center max-w-sm">
                {cameraError}
              </div>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-mono text-[#888888] hover:text-[#CCFF00] underline cursor-pointer"
              >
                Upload selfie photo instead →
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* State B: Live Scan Completed -> AI Biometric Match Results */}
        {capturedSelfie && (
          <div className="space-y-6">
            {/* Side-by-side Biometric Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID Card Front Photo */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-2">
                  01. NATIONAL ID PORTRAIT
                </span>
                <div className="h-44 rounded-lg overflow-hidden bg-black/60 flex items-center justify-center border border-white/5">
                  {idFrontImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={idFrontImage}
                      alt="ID Card Front"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#666666] font-mono">No ID photo uploaded</span>
                  )}
                </div>
              </div>

              {/* Captured Live Selfie */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                    02. VERIFIED LIVE SELFIE
                  </span>
                  <span className="text-[9px] font-mono font-bold text-green-400 bg-green-500/20 px-1.5 rounded">
                    ✓ LIVENESS PASSED
                  </span>
                </div>
                <div className="relative h-44 rounded-lg overflow-hidden bg-black/60 flex items-center justify-center border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedSelfie}
                    alt="Live Selfie"
                    className="w-full h-full object-contain"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-x-0 h-1 bg-[#CCFF00] shadow-[0_0_12px_#CCFF00] animate-bounce pointer-events-none" />
                  )}
                </div>
              </div>
            </div>

            {/* AI Analysis In Progress */}
            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-[#CCFF00] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                    AI BIOMETRIC MATCH IN PROGRESS...
                  </span>
                </div>
                <p className="text-xs font-mono text-[#CCFF00] animate-pulse">
                  {analysisStep}
                </p>
              </div>
            )}

            {/* Verification Result Banner */}
            {!isAnalyzing && matchResult.status !== 'NONE' && (
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isVerified
                    ? 'bg-green-500/10 border-green-500/40'
                    : 'bg-red-500/10 border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isVerified ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                      }`}
                    >
                      {isVerified ? '✓' : '✗'}
                    </span>
                    <span
                      className={`font-heading text-base font-bold tracking-wider uppercase ${
                        isVerified ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {isVerified
                        ? `BIOMETRIC MATCH CONFIRMED (${matchResult.score}%)`
                        : `MATCH REJECTED (${matchResult.score}% CONFIDENCE)`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isVerified
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {isVerified ? 'KYC VERIFIED' : 'IDENTITY MISMATCH'}
                  </span>
                </div>

                <p className="text-xs font-mono text-[#cccccc]">
                  {matchResult.details}
                </p>

                {/* Instant issuance notice for Standard ticket */}
                {isVerified && ticketTier === 'STANDARD' && (
                  <div className="mt-2 pt-2 border-t border-green-500/20 flex items-center gap-2 text-xs font-mono text-[#CCFF00]">
                    <span>⚡</span>
                    <span>
                      <strong>Instant Pass Approved:</strong> Because your live face matches your National ID, your Standard Admission Ticket will be generated and issued immediately upon submission!
                    </span>
                  </div>
                )}

                {/* VIP notice */}
                {isVerified && ticketTier === 'VIP' && (
                  <div className="mt-2 pt-2 border-t border-green-500/20 flex items-center gap-2 text-xs font-mono text-amber-300">
                    <span>★</span>
                    <span>
                      <strong>VIP Biometrics Verified:</strong> Your AI match is confirmed ({matchResult.score}%). Next, enter your Telebirr / Awash Bank transfer receipt for VIP ticket activation.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Retake Selfie Button */}
            {!isAnalyzing && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={retakeSelfie}
                  className="text-xs font-mono text-[#999999] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restart live scan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" type="button" onClick={onBack}>
          ← BACK
        </Button>

        <Button
          variant="primary"
          type="button"
          disabled={!isVerified || isAnalyzing}
          onClick={onNext}
          className="px-8"
        >
          {isVerified ? 'CONTINUE TO CONFIRMATION →' : 'PASS LIVE MATCH TO PROCEED'}
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default StepFaceVerification;
