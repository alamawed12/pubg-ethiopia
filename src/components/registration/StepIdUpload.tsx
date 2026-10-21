'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface StepIdUploadProps {
  formData: {
    idFrontImage: string;
    idBackImage: string;
  };
  updateField: (field: string, value: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

function compressImage(file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
    };
    reader.onerror = (error) => reject(error);
  });
}

function ImageUploadZone({
  label,
  sublabel,
  value,
  onUpload,
  onRemove,
}: {
  label: string;
  sublabel: string;
  value: string;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, or WebP)');
        return;
      }
      try {
        setCompressing(true);
        const compressed = await compressImage(file, 1280, 1280, 0.82);
        onUpload(compressed);
      } catch {
        setError('Failed to process image. Please try another photo.');
      } finally {
        setCompressing(false);
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden border border-[#CCFF00]/30 bg-[#0a0a0a]"
      >
        <div className="p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="w-full h-48 object-contain rounded-xl"
          />
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-[#111111] border-t border-white/10">
          <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-wider">
            {label} ✓
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer uppercase tracking-wider"
          >
            REMOVE
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer
          border-2 border-dashed transition-all duration-200
          ${dragOver
            ? 'border-[#CCFF00] bg-[#CCFF00]/5'
            : 'border-white/20 hover:border-[#CCFF00]/50 bg-[#0a0a0a] hover:bg-[#0a0a0a]/80'
          }
        `}
      >
        {compressing ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-7 h-7 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs text-[#CCFF00] tracking-wider uppercase">
              OPTIMIZING PHOTO...
            </span>
          </div>
        ) : (
          <>
            {/* Camera/Upload Icon */}
            <div className={`p-3 rounded-full ${dragOver ? 'bg-[#CCFF00]/10' : 'bg-white/5'} transition-colors`}>
              <svg
                className={`w-8 h-8 ${dragOver ? 'text-[#CCFF00]' : 'text-[#999999]'} transition-colors`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>

            <div className="text-center">
              <p className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                {label}
              </p>
              <p className="text-[10px] font-mono text-[#999999] mt-1">
                {sublabel}
              </p>
              <p className="text-[10px] font-mono text-[#999999]/60 mt-1">
                JPG, PNG, WebP • Auto-optimized
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 font-mono text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function StepIdUpload({ formData, updateField, onNext, onBack }: StepIdUploadProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!formData.idFrontImage || !formData.idBackImage) {
      setValidationError('Please upload both the front and back of your ID to continue.');
      return;
    }
    setValidationError(null);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Step Header */}
      <div>
        <div className="font-mono text-xs font-semibold tracking-widest text-[#CCFF00] uppercase">
          STEP 03
        </div>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          IDENTITY VERIFICATION
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#999999]">
          Upload clear photos of the front and back of your national ID card for event check-in verification.
        </p>
      </div>

      {/* Upload Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageUploadZone
          label="Front of ID"
          sublabel="Clear photo of the front side"
          value={formData.idFrontImage}
          onUpload={(dataUrl) => {
            updateField('idFrontImage', dataUrl);
            setValidationError(null);
          }}
          onRemove={() => updateField('idFrontImage', '')}
        />
        <ImageUploadZone
          label="Back of ID"
          sublabel="Clear photo of the back side"
          value={formData.idBackImage}
          onUpload={(dataUrl) => {
            updateField('idBackImage', dataUrl);
            setValidationError(null);
          }}
          onRemove={() => updateField('idBackImage', '')}
        />
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 rounded-sm border border-amber-500/30 bg-amber-950/20 p-4 text-amber-200">
        <svg className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div className="text-xs font-mono space-y-1">
          <p className="font-semibold text-amber-300 uppercase tracking-wide">
            DATA SECURITY NOTICE
          </p>
          <p className="text-amber-200/80 leading-relaxed">
            Your ID document will be securely stored and used only for identity verification at event check-in. All ID images will be permanently deleted after the event concludes.
          </p>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs text-red-400"
        >
          {validationError}
        </motion.p>
      )}

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <Button type="button" variant="secondary" size="lg" onClick={onBack} className="w-full sm:w-auto min-w-[140px]">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={handleContinue} className="w-full sm:w-auto min-w-[180px]">
          CONTINUE
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </motion.div>
  );
}

export default StepIdUpload;
