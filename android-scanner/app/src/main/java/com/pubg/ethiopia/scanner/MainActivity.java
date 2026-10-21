package com.pubg.ethiopia.scanner;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.zxing.ResultPoint;
import com.journeyapps.barcodescanner.BarcodeCallback;
import com.journeyapps.barcodescanner.BarcodeResult;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_REQUEST = 1001;

    private DecoratedBarcodeView barcodeScannerView;
    private TextView tvStatusMessage;
    private TextView tvTotalCount;
    private TextView tvVipCount;
    private TextView tvStandardCount;
    private TextView tvStaffName;
    private View connectionIndicator;
    private Button btnToggleFlash;

    private boolean isTorchOn = false;
    private boolean isProcessing = false;

    private SharedPreferences prefs;
    private String serverUrl;
    private String secretKey;
    private String staffName;

    private int countTotal = 0;
    private int countVip = 0;
    private int countStandard = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(SettingsActivity.PREFS_NAME, Context.MODE_PRIVATE);

        barcodeScannerView = findViewById(R.id.barcodeScannerView);
        tvStatusMessage = findViewById(R.id.tvStatusMessage);
        tvTotalCount = findViewById(R.id.tvTotalCount);
        tvVipCount = findViewById(R.id.tvVipCount);
        tvStandardCount = findViewById(R.id.tvStandardCount);
        tvStaffName = findViewById(R.id.tvStaffName);
        connectionIndicator = findViewById(R.id.connectionIndicator);
        btnToggleFlash = findViewById(R.id.btnToggleFlash);
        Button btnManualEntry = findViewById(R.id.btnManualEntry);
        Button btnSettings = findViewById(R.id.btnSettings);

        loadConfiguration();

        // Check camera permission
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
        } else {
            initScanner();
        }

        // Torch Toggle
        btnToggleFlash.setOnClickListener(v -> toggleTorch());

        // Manual Code Entry
        btnManualEntry.setOnClickListener(v -> showManualEntryDialog());

        // Settings Activity
        btnSettings.setOnClickListener(v -> {
            Intent intent = new Intent(this, SettingsActivity.class);
            startActivity(intent);
        });

        // Test server connection on startup
        checkServerStatus();
    }

    private void loadConfiguration() {
        serverUrl = prefs.getString(SettingsActivity.KEY_SERVER_URL, getString(R.string.default_server_url));
        if (serverUrl != null && serverUrl.contains("pubg-ethiopia.vercel.app")) {
            serverUrl = serverUrl.replace("pubg-ethiopia.vercel.app", "pubgmethiopia.vercel.app");
            prefs.edit().putString(SettingsActivity.KEY_SERVER_URL, serverUrl).apply();
        }
        secretKey = prefs.getString(SettingsActivity.KEY_SECRET_KEY, getString(R.string.default_secret_key));
        staffName = prefs.getString(SettingsActivity.KEY_STAFF_NAME, getString(R.string.default_staff_name));

        tvStaffName.setText(staffName.toUpperCase());

        countTotal = prefs.getInt(SettingsActivity.KEY_TOTAL_COUNT, 0);
        countVip = prefs.getInt(SettingsActivity.KEY_VIP_COUNT, 0);
        countStandard = prefs.getInt(SettingsActivity.KEY_STANDARD_COUNT, 0);

        updateCountersUI();
    }

    private void updateCountersUI() {
        tvTotalCount.setText(String.valueOf(countTotal));
        tvVipCount.setText(String.valueOf(countVip));
        tvStandardCount.setText(String.valueOf(countStandard));
    }

    private void checkServerStatus() {
        ApiClient.getInstance().testConnection(serverUrl, secretKey, (success, message) -> {
            if (connectionIndicator != null) {
                connectionIndicator.setBackgroundResource(success ? R.drawable.circle_green : R.drawable.circle_red);
            }
        });
    }

    private void initScanner() {
        barcodeScannerView.decodeContinuous(new BarcodeCallback() {
            @Override
            public void barcodeResult(BarcodeResult result) {
                if (isProcessing || result.getText() == null || result.getText().trim().isEmpty()) {
                    return;
                }
                processTicket(result.getText());
            }

            @Override
            public void possibleResultPoints(List<ResultPoint> resultPoints) {
                // Viewfinder scanning animation
            }
        });
    }

    private void processTicket(String rawTicketData) {
        isProcessing = true;
        barcodeScannerView.pause();

        tvStatusMessage.setText("VERIFYING WITH COMMAND CENTER...");
        tvStatusMessage.setTextColor(getResources().getColor(R.color.pubg_gold));

        ApiClient.getInstance().checkInTicket(serverUrl, rawTicketData, staffName, secretKey, new ApiClient.ApiCallback() {
            @Override
            public void onSuccess(ScanResult result) {
                if (result.isSuccess()) {
                    countTotal++;
                    if (result.isVip()) {
                        countVip++;
                    } else {
                        countStandard++;
                    }
                    prefs.edit()
                            .putInt(SettingsActivity.KEY_TOTAL_COUNT, countTotal)
                            .putInt(SettingsActivity.KEY_VIP_COUNT, countVip)
                            .putInt(SettingsActivity.KEY_STANDARD_COUNT, countStandard)
                            .apply();
                    updateCountersUI();
                }

                showResultDialog(result);
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                ScanResult errorResult = new ScanResult();
                errorResult.status = "ERROR";
                errorResult.message = errorMessage;
                showResultDialog(errorResult);
            }
        });
    }

    private void showResultDialog(ScanResult result) {
        ScanResultDialog dialog = new ScanResultDialog(this, result, () -> {
            resumeScanning();
        });
        dialog.show();
    }

    private void resumeScanning() {
        isProcessing = false;
        tvStatusMessage.setText(getString(R.string.status_ready));
        tvStatusMessage.setTextColor(getResources().getColor(R.color.pubg_lime));
        barcodeScannerView.resume();
    }

    private void toggleTorch() {
        if (isTorchOn) {
            barcodeScannerView.setTorchOff();
            btnToggleFlash.setText("TORCH");
            btnToggleFlash.setTextColor(getResources().getColor(R.color.white));
            isTorchOn = false;
        } else {
            barcodeScannerView.setTorchOn();
            btnToggleFlash.setText("TORCH ON");
            btnToggleFlash.setTextColor(getResources().getColor(R.color.pubg_lime));
            isTorchOn = true;
        }
    }

    private void showManualEntryDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_manual_entry, null);
        builder.setView(dialogView);

        AlertDialog dialog = builder.create();
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        }

        EditText etTicketInput = dialogView.findViewById(R.id.etTicketInput);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnSubmit = dialogView.findViewById(R.id.btnSubmit);

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSubmit.setOnClickListener(v -> {
            String input = etTicketInput.getText().toString().trim();
            if (input.isEmpty()) {
                Toast.makeText(this, "Please enter a reference ID or UID", Toast.LENGTH_SHORT).show();
                return;
            }
            dialog.dismiss();
            processTicket(input);
        });

        dialog.show();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                initScanner();
                barcodeScannerView.resume();
            } else {
                Toast.makeText(this, "Camera permission required for ticket scanning", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadConfiguration();
        checkServerStatus();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            barcodeScannerView.resume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        barcodeScannerView.pause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (isTorchOn) {
            barcodeScannerView.setTorchOff();
        }
    }
}
