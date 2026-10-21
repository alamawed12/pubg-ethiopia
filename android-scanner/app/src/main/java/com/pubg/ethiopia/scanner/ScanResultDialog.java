package com.pubg.ethiopia.scanner;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;

public class ScanResultDialog extends Dialog {

    public interface OnDismissListener {
        void onDismissed();
    }

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable autoDismissRunnable;

    public ScanResultDialog(@NonNull Context context, ScanResult result, OnDismissListener dismissListener) {
        super(context);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        View view = LayoutInflater.from(context).inflate(R.layout.dialog_scan_result, null);
        setContentView(view);

        if (getWindow() != null) {
            getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
            getWindow().setLayout(
                    (int) (context.getResources().getDisplayMetrics().widthPixels * 0.92),
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
        }

        LinearLayout statusBanner = view.findViewById(R.id.statusBanner);
        TextView tvStatusIcon = view.findViewById(R.id.tvStatusIcon);
        TextView tvStatusTitle = view.findViewById(R.id.tvStatusTitle);
        TextView tvInGameName = view.findViewById(R.id.tvInGameName);
        TextView tvFullName = view.findViewById(R.id.tvFullName);
        TextView tvTicketTier = view.findViewById(R.id.tvTicketTier);
        TextView tvPubgUid = view.findViewById(R.id.tvPubgUid);
        TextView tvReferenceId = view.findViewById(R.id.tvReferenceId);
        TextView tvCheckInTime = view.findViewById(R.id.tvCheckInTime);
        TextView tvDetailedMessage = view.findViewById(R.id.tvDetailedMessage);
        Button btnDismiss = view.findViewById(R.id.btnDismiss);

        // Populate fields
        tvInGameName.setText(result.inGameName.isEmpty() ? "UNKNOWN ATTENDEE" : result.inGameName);
        tvFullName.setText(result.fullName.isEmpty() ? "—" : result.fullName);
        tvPubgUid.setText(result.pubgUid.isEmpty() ? "—" : result.pubgUid);
        tvReferenceId.setText(result.referenceId.isEmpty() ? "—" : result.referenceId);
        tvCheckInTime.setText(result.checkedInAt.isEmpty() ? "Just now" : result.checkedInAt);
        tvDetailedMessage.setText(result.message);

        boolean isVip = result.isVip();
        tvTicketTier.setText(isVip ? "VIP ACCESS PASS" : "STANDARD ACCESS");
        tvTicketTier.setTextColor(isVip ? context.getResources().getColor(R.color.pubg_gold) : context.getResources().getColor(R.color.pubg_lime));

        // Feedback sound and haptics
        playFeedback(context, result);

        // Style based on validation status
        if (result.isSuccess()) {
            statusBanner.setBackgroundColor(context.getResources().getColor(R.color.pubg_green_bg));
            tvStatusIcon.setText("✓");
            tvStatusIcon.setTextColor(context.getResources().getColor(R.color.pubg_green));
            tvStatusTitle.setText(isVip ? "★ GENUINE VIP PASS CONFIRMED ★" : "GENUINE TICKET VERIFIED");
            tvStatusTitle.setTextColor(context.getResources().getColor(R.color.pubg_green));
            btnDismiss.setBackgroundColor(context.getResources().getColor(R.color.pubg_lime));
        } else if (result.isAlreadyCheckedIn()) {
            statusBanner.setBackgroundColor(context.getResources().getColor(R.color.pubg_red_bg));
            tvStatusIcon.setText("⚠");
            tvStatusIcon.setTextColor(context.getResources().getColor(R.color.pubg_amber));
            tvStatusTitle.setText("ALREADY CHECKED IN — DUPLICATE");
            tvStatusTitle.setTextColor(context.getResources().getColor(R.color.pubg_amber));
            btnDismiss.setBackgroundColor(context.getResources().getColor(R.color.pubg_amber));
        } else if ("VIP_UNAPPROVED".equalsIgnoreCase(result.status)) {
            statusBanner.setBackgroundColor(context.getResources().getColor(R.color.pubg_gold_bg));
            tvStatusIcon.setText("⏳");
            tvStatusIcon.setTextColor(context.getResources().getColor(R.color.pubg_gold));
            tvStatusTitle.setText("VIP PAYMENT PENDING AUDIT");
            tvStatusTitle.setTextColor(context.getResources().getColor(R.color.pubg_gold));
            btnDismiss.setBackgroundColor(context.getResources().getColor(R.color.pubg_gold));
        } else { // Counterfeit / Invalid / Error
            statusBanner.setBackgroundColor(context.getResources().getColor(R.color.pubg_red_bg));
            tvStatusIcon.setText("✗");
            tvStatusIcon.setTextColor(context.getResources().getColor(R.color.pubg_red));
            tvStatusTitle.setText("COUNTERFEIT / PASS NOT FOUND");
            tvStatusTitle.setTextColor(context.getResources().getColor(R.color.pubg_red));
            btnDismiss.setBackgroundColor(context.getResources().getColor(R.color.pubg_red));
        }

        btnDismiss.setOnClickListener(v -> dismiss());

        setOnDismissListener(dialog -> {
            if (autoDismissRunnable != null) {
                handler.removeCallbacks(autoDismissRunnable);
            }
            if (dismissListener != null) {
                dismissListener.onDismissed();
            }
        });

        // Auto dismiss after 4 seconds for hands-free gate throughput
        autoDismissRunnable = this::dismiss;
        handler.postDelayed(autoDismissRunnable, 4000);
    }

    private void playFeedback(Context context, ScanResult result) {
        try {
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            ToneGenerator toneGen = new ToneGenerator(AudioManager.STREAM_MUSIC, 100);

            if (result.isSuccess()) {
                // Happy high chime
                toneGen.startTone(ToneGenerator.TONE_PROP_BEEP2, 180);
                if (vibrator != null && vibrator.hasVibrator()) {
                    vibrator.vibrate(100);
                }
            } else {
                // Warning low buzzer
                toneGen.startTone(ToneGenerator.TONE_CDMA_SOFT_ERROR_LITE, 350);
                if (vibrator != null && vibrator.hasVibrator()) {
                    long[] pattern = {0, 150, 100, 200};
                    vibrator.vibrate(pattern, -1);
                }
            }
        } catch (Exception e) {
            // Audio/Vibration failure ignored on restricted devices
        }
    }
}
