package com.pubg.ethiopia.scanner;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class SettingsActivity extends AppCompatActivity {

    public static final String PREFS_NAME = "pubg_scanner_prefs";
    public static final String KEY_SERVER_URL = "server_url";
    public static final String KEY_SECRET_KEY = "secret_key";
    public static final String KEY_STAFF_NAME = "staff_name";

    public static final String KEY_TOTAL_COUNT = "counter_total";
    public static final String KEY_VIP_COUNT = "counter_vip";
    public static final String KEY_STANDARD_COUNT = "counter_standard";

    private EditText etServerUrl;
    private EditText etSecretKey;
    private EditText etStaffName;
    private TextView tvTestResult;
    private Button btnTestConnection;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        etServerUrl = findViewById(R.id.etServerUrl);
        etSecretKey = findViewById(R.id.etSecretKey);
        etStaffName = findViewById(R.id.etStaffName);
        tvTestResult = findViewById(R.id.tvTestResult);
        btnTestConnection = findViewById(R.id.btnTestConnection);
        Button btnSaveSettings = findViewById(R.id.btnSaveSettings);
        Button btnResetCounter = findViewById(R.id.btnResetCounter);

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        etServerUrl.setText(prefs.getString(KEY_SERVER_URL, getString(R.string.default_server_url)));
        etSecretKey.setText(prefs.getString(KEY_SECRET_KEY, getString(R.string.default_secret_key)));
        etStaffName.setText(prefs.getString(KEY_STAFF_NAME, getString(R.string.default_staff_name)));

        btnTestConnection.setOnClickListener(v -> {
            String url = etServerUrl.getText().toString().trim();
            String key = etSecretKey.getText().toString().trim();

            if (url.isEmpty()) {
                Toast.makeText(this, "Please enter a valid URL", Toast.LENGTH_SHORT).show();
                return;
            }

            tvTestResult.setVisibility(View.VISIBLE);
            tvTestResult.setText("Testing connection...");
            tvTestResult.setTextColor(getResources().getColor(R.color.silver));

            ApiClient.getInstance().testConnection(url, key, (success, message) -> {
                tvTestResult.setText(message);
                if (success) {
                    tvTestResult.setTextColor(getResources().getColor(R.color.pubg_green));
                } else {
                    tvTestResult.setTextColor(getResources().getColor(R.color.pubg_red));
                }
            });
        });

        btnSaveSettings.setOnClickListener(v -> {
            String url = etServerUrl.getText().toString().trim();
            String key = etSecretKey.getText().toString().trim();
            String staff = etStaffName.getText().toString().trim();

            if (url.isEmpty()) url = getString(R.string.default_server_url);
            if (key.isEmpty()) key = getString(R.string.default_secret_key);
            if (staff.isEmpty()) staff = getString(R.string.default_staff_name);

            prefs.edit()
                    .putString(KEY_SERVER_URL, url)
                    .putString(KEY_SECRET_KEY, key)
                    .putString(KEY_STAFF_NAME, staff)
                    .apply();

            Toast.makeText(this, "Settings saved successfully", Toast.LENGTH_SHORT).show();
            setResult(RESULT_OK);
            finish();
        });

        btnResetCounter.setOnClickListener(v -> {
            prefs.edit()
                    .putInt(KEY_TOTAL_COUNT, 0)
                    .putInt(KEY_VIP_COUNT, 0)
                    .putInt(KEY_STANDARD_COUNT, 0)
                    .apply();
            Toast.makeText(this, "Local counter reset to 0", Toast.LENGTH_SHORT).show();
        });
    }
}
