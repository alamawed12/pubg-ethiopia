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

export function StepFaceVerification({
  idFrontImage,
  selfieImage,
  updateField,
  onNext,
  onBack,
}: StepFaceVerificationProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedSelfie, setCapturedSelfie] = useState<string>(selfieImage || '');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Shutter audio feedback
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext policy
    }
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      }

      streamRef.current = newStream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = newStream;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.onloadedmetadata = () => {
              video.play().catch(() => {});
            };
          });
        }
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access unavailable. You can upload a photo from your gallery below.');
    }
  }, []);

  // Start camera on mount if no selfie captured yet
  useEffect(() => {
    if (!capturedSelfie) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, capturedSelfie, startCamera, stopCamera]);

  // Flip camera between front and rear
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Shutter action
  const handleTakePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    playShutterSound();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedSelfie(dataUrl);
    updateField('selfieImage', dataUrl);
    updateField('faceMatchStatus', 'PENDING_ADMIN_REVIEW');
    updateField('faceMatchScore', 100);
    stopCamera();
  }, [facingMode, playShutterSound, stopCamera, updateField]);

  // Upload photo fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedSelfie(dataUrl);
      updateField('selfieImage', dataUrl);
      updateField('faceMatchStatus', 'PENDING_ADMIN_REVIEW');
      updateField('faceMatchScore', 100);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedSelfie('');
    updateField('selfieImage', '');
    updateField('faceMatchScore', 0);
    updateField('faceMatchStatus', 'NOT_VERIFIED');
    startCamera(facingMode);
  };

  const hasPhoto = Boolean(capturedSelfie);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
            STEP 04 // IDENTITY VERIFICATION
          </span>
          <span className="bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
            FACE PHOTO
          </span>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          TAKE YOUR FACE PHOTO
        </h2>
        <p className="text-sm text-[#999999] mt-1">
          Position your face in the center of the frame and click <strong>Take Photo</strong>. Our event administrators will verify your photo with your ID card before approving your ticket.
        </p>
      </div>

      {/* Main Card */}
      <div
        className="p-5 sm:p-6 rounded-2xl border"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* State A: Face Photo Shooter Viewfinder */}
        {!capturedSelfie && (
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#CCFF00]/40 text-[#CCFF00] font-heading font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                <span>🎯</span>
                <span>CENTER YOUR FACE &amp; LOOK AT THE CAMERA</span>
              </div>
              <p className="text-xs font-mono text-[#888888]">Hold steady and ensure good lighting</p>
            </div>

            {/* Circular Camera Viewfinder */}
            <div
              onClick={() => {
                if (videoRef.current && videoRef.current.paused) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.35)] flex items-center justify-center bg-black cursor-pointer"
              style={{
                WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                transform: 'translateZ(0)',
              }}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  WebkitTransform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />

              {/* Pulsing Target Reticle */}
              <div className="absolute inset-0 pointer-events-none rounded-full border border-[#CCFF00]/30 animate-pulse" />

              {/* Oval Head Placement Guide */}
              <div className="absolute w-40 h-52 sm:w-44 sm:h-56 rounded-[50%] border-2 border-dashed border-[#CCFF00]/70 pointer-events-none" />

              {/* Horizontal Eye Alignment Line */}
              <div className="absolute inset-x-8 top-[42%] h-[1px] bg-[#CCFF00]/40 pointer-events-none" />
            </div>

            {/* Shutter Button & Controls */}
            <div className="flex flex-col items-center justify-center gap-3 w-full max-w-sm pt-2">
              <button
                type="button"
                onClick={handleTakePhoto}
                className="w-full py-4 px-6 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 text-black font-heading font-black text-base uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2"
              >
                <span className="text-xl">📸</span>
                <span>TAKE PHOTO</span>
              </button>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Flip Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#888888] hover:text-[#CCFF00] transition-all cursor-pointer"
                >
                  Upload photo →
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-mono text-center max-w-sm">
                {cameraError}
              </div>
            )}
          </div>
        )}

        {/* State B: Photo Captured -> Ready for Admin Review */}
        {capturedSelfie && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID Card Front Photo */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-2">
                  01. NATIONAL ID CARD (FRONT)
                </span>
                <div className="h-48 rounded-lg overflow-hidden bg-black/60 flex items-center justify-center border border-white/5">
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

              {/* Captured Face Photo */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-2">
                  02. YOUR CAPTURED FACE PHOTO
                </span>
                <div className="h-48 rounded-lg overflow-hidden bg-black/60 flex items-center justify-center border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedSelfie}
                    alt="Captured Face Photo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Instant Confirmation Banner */}
            <div className="p-4 rounded-xl border bg-green-500/10 border-green-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <span className="font-heading text-base font-bold tracking-wider uppercase text-green-400">
                    FACE PHOTO ATTACHED
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                  READY FOR ADMIN REVIEW
                </span>
              </div>
              <p className="text-xs font-mono text-[#cccccc] leading-relaxed">
                Your face photo has been captured. The event administration team will review and verify your identity photo alongside your National ID before confirming your registration.
              </p>
            </div>

            {/* Retake Photo Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={retakePhoto}
                className="text-xs font-mono text-[#999999] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retake photo
              </button>
            </div>
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
          disabled={!hasPhoto}
          onClick={onNext}
          className="px-8 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {hasPhoto ? 'CONTINUE →' : 'TAKE PHOTO TO PROCEED'}
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default StepFaceVerification;
