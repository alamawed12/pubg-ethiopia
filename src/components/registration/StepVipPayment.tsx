'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StarVipIcon, CameraIcon, ShieldSecurityIcon, CheckMarkIcon } from '@/components/ui/TacticalIcons';

export interface StepVipPaymentProps {
  formData: {
    ticketTier: 'STANDARD' | 'VIP';
    vipPrice: number;
    paymentMethod?: string;
    paymentTxnCode?: string;
    telegramUsername?: string;
    paymentReceiptImage?: string;
  };
  updateField: (field: string, value: string | boolean | number) => void;
  onNext: () => void;
  onBack: () => void;
}

function compressImage(file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.82): Promise<string> {
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

export function StepVipPayment({
  formData,
  updateField,
  onNext,
  onBack,
}: StepVipPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<'TELEBIRR' | 'AWASH_BANK'>(
    (formData.paymentMethod as 'TELEBIRR' | 'AWASH_BANK') || 'TELEBIRR'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ txnCode?: string; telegram?: string; receipt?: string }>({});
  const [dragOver, setDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic payment accounts configured by Head Admin
  const [telebirrNumber, setTelebirrNumber] = useState('+251950986841');
  const [telebirrName, setTelebirrName] = useState('Tsige Dagne');
  const [awashAccount, setAwashAccount] = useState('013201378990300');
  const [awashName, setAwashName] = useState('Tsige Dagne');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.telebirrNumber) setTelebirrNumber(data.telebirrNumber);
        if (data.telebirrName) setTelebirrName(data.telebirrName);
        if (data.awashAccount) setAwashAccount(data.awashAccount);
        if (data.awashName) setAwashName(data.awashName);
      })
      .catch((err) => console.warn('Failed to load dynamic payment accounts in StepVipPayment', err));
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const handleSelectMethod = (method: 'TELEBIRR' | 'AWASH_BANK') => {
    setSelectedMethod(method);
    updateField('paymentMethod', method);
  };

  const handleFileProcess = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, receipt: 'Please upload an image file (JPG, PNG, WebP)' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, receipt: 'Image file size must be under 10MB' }));
        return;
      }

      try {
        setIsCompressing(true);
        setErrors((prev) => ({ ...prev, receipt: undefined }));
        const compressed = await compressImage(file, 1280, 1280, 0.85);
        updateField('paymentReceiptImage', compressed);
      } catch (err) {
        console.error(err);
        setErrors((prev) => ({ ...prev, receipt: 'Failed to process image. Please try another photo.' }));
      } finally {
        setIsCompressing(false);
      }
    },
    [updateField]
  );

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { txnCode?: string; telegram?: string; receipt?: string } = {};

    if (!formData.paymentReceiptImage) {
      newErrors.receipt = 'Please upload a screenshot of your payment transfer for admin approval';
    }

    if (!formData.telegramUsername || formData.telegramUsername.trim().length < 3) {
      newErrors.telegram = 'Please enter your Telegram username or phone number (e.g. @yourname)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (!formData.paymentMethod) {
      updateField('paymentMethod', selectedMethod);
    }
    onNext();
  };

  return (
    <motion.form
      onSubmit={handleContinue}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
      noValidate
    >
      {/* Step Header */}
      <div>
        <div className="font-mono text-xs font-semibold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
          <StarVipIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>STEP 05 • VIP PASS PAYMENT</span>
        </div>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          VIP PAYMENT & APPROVAL
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-silver,#999999)] leading-relaxed">
          Transfer the VIP pass fee to an official account below and upload your payment screenshot. Our Head Admin will review your payment to approve and unlock your VIP Pass in your Attendee Portal.
        </p>
      </div>

      {/* Fee Badge Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30">
        <div>
          <span className="block font-mono text-[10px] tracking-widest text-amber-300 uppercase">
            VIP ALL-ACCESS ADMISSION FEE
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-black text-amber-400">
            {formData.vipPrice || 500} ETB
          </span>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold tracking-wider">
            PRIORITY ADMIN APPROVAL
          </span>
        </div>
      </div>

      {/* ─── PAYMENT ACCOUNTS WITH ONE-CLICK COPY ─── */}
      <div className="space-y-3">
        <label className="block text-xs uppercase font-mono tracking-wider text-[#cccccc]">
          CHOOSE OFFICIAL PAYMENT ACCOUNT
        </label>

        {/* Account 1: Telebirr */}
        <div
          onClick={() => handleSelectMethod('TELEBIRR')}
          className={`p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
            selectedMethod === 'TELEBIRR'
              ? 'border-amber-400 bg-[#161208] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'border-white/10 bg-[#141414] hover:border-white/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Radio indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedMethod === 'TELEBIRR'
                    ? 'border-amber-400 bg-amber-400/20'
                    : 'border-white/30'
                }`}
              >
                {selectedMethod === 'TELEBIRR' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-wider">
                    TELEBIRR
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold">
                    INSTANT TRANSFER
                  </span>
                </div>
                <div className="font-mono text-xs text-neutral-300 mt-0.5">
                  Account Name: <strong className="text-white">{telebirrName}</strong>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-amber-400 mt-1">
                  {telebirrNumber}
                </div>
              </div>
            </div>

            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(telebirrNumber, 'telebirr');
              }}
              className="px-4 py-2.5 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 bg-black/60 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copiedKey === 'telebirr' ? 'COPIED!' : 'COPY NUMBER'}</span>
            </button>
          </div>
        </div>

        {/* Account 2: Awash Bank */}
        <div
          onClick={() => handleSelectMethod('AWASH_BANK')}
          className={`p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
            selectedMethod === 'AWASH_BANK'
              ? 'border-amber-400 bg-[#161208] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'border-white/10 bg-[#141414] hover:border-white/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Radio indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedMethod === 'AWASH_BANK'
                    ? 'border-amber-400 bg-amber-400/20'
                    : 'border-white/30'
                }`}
              >
                {selectedMethod === 'AWASH_BANK' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-wider">
                    AWASH BANK
                  </span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono uppercase font-bold">
                    BANK TRANSFER
                  </span>
                </div>
                <div className="font-mono text-xs text-neutral-300 mt-0.5">
                  Account Name: <strong className="text-white">{awashName}</strong>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-amber-400 mt-1">
                  {awashAccount}
                </div>
              </div>
            </div>

            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(awashAccount, 'awash');
              }}
              className="px-4 py-2.5 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 bg-black/60 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copiedKey === 'awash' ? 'COPIED!' : 'COPY ACCOUNT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── UPLOAD PAYMENT RECEIPT SCREENSHOT (REQUIRED) ─── */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs uppercase font-mono tracking-wider text-amber-300 font-bold flex items-center justify-between">
          <span>UPLOAD PAYMENT SCREENSHOT (REQUIRED) *</span>
          {formData.paymentReceiptImage && (
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <CheckMarkIcon className="w-2.5 h-2.5 stroke-[3]" />
              <span>Screenshot Attached</span>
            </span>
          )}
        </label>

        {formData.paymentReceiptImage ? (
          <div className="relative p-3 rounded-xl border-2 border-emerald-500/50 bg-[#0d1a0d] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.paymentReceiptImage}
                alt="Payment Receipt Preview"
                className="w-16 h-16 object-cover rounded-lg border border-emerald-500/30"
              />
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckMarkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Receipt Attached Successfully</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Ready for admin payment verification
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateField('paymentReceiptImage', '')}
              className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-mono hover:bg-red-900/60 transition-colors"
            >
              REMOVE
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileProcess(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
              dragOver
                ? 'border-amber-400 bg-amber-400/10'
                : errors.receipt
                ? 'border-red-500/60 bg-red-950/20'
                : 'border-amber-500/40 bg-[#161208] hover:border-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file);
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CameraIcon className="w-5 h-5" />
              </div>
              <div className="font-heading font-black text-sm uppercase text-white tracking-wider">
                {isCompressing ? 'OPTIMIZING SCREENSHOT...' : 'CLICK OR DRAG TO UPLOAD RECEIPT SCREENSHOT'}
              </div>
              <p className="font-mono text-[11px] text-[#999999] max-w-sm">
                Take a screenshot of your Telebirr confirmation or bank transfer receipt and upload it here (JPG, PNG, WebP)
              </p>
            </div>
          </div>
        )}
        {errors.receipt && (
          <p className="font-mono text-xs text-red-400 mt-1">{errors.receipt}</p>
        )}
      </div>

      {/* ─── OPTIONAL TRANSACTION DETAILS ─── */}
      <div className="space-y-4 pt-2">
        <div>
          <Input
            label="Payment Transaction ID / Reference Code (Optional)"
            name="paymentTxnCode"
            value={formData.paymentTxnCode || ''}
            onChange={(e) => updateField('paymentTxnCode', e.target.value.toUpperCase())}
            placeholder={
              selectedMethod === 'TELEBIRR'
                ? 'e.g. MP260312.1450.A00123'
                : 'e.g. AWASH-98421038'
            }
          />
          <p className="mt-1 font-mono text-[11px] text-neutral-400">
            If visible on your receipt, entering your transaction ID helps speed up verification.
          </p>
        </div>

        <div>
          <Input
            label="Your Telegram Username or Contact Number"
            name="telegramUsername"
            value={formData.telegramUsername || ''}
            onChange={(e) => updateField('telegramUsername', e.target.value)}
            placeholder="e.g. @player_eth or +2519..."
            error={errors.telegram}
            required
          />
          <p className="mt-1 font-mono text-[11px] text-amber-400/90">
            Our Head Admin will use this contact to message you directly about your VIP admission.
          </p>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 flex items-start gap-3 text-xs text-neutral-300">
        <ShieldSecurityIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-heading uppercase font-bold text-white tracking-wider block mb-0.5">
            PRIORITY VIP APPROVAL SYSTEM
          </span>
          <span>
            Once submitted, your screenshot will be reviewed by the Head Admin. You will be redirected to your Attendee Portal where you can check your live VIP pass status.
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          className="w-full sm:w-auto min-w-[140px] order-2 sm:order-1"
        >
          BACK
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:flex-1 order-1 sm:order-2"
        >
          VERIFY & REVIEW DETAILS →
        </Button>
      </div>
    </motion.form>
  );
}

export default StepVipPayment;
