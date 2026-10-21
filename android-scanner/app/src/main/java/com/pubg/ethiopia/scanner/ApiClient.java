package com.pubg.ethiopia.scanner;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.io.IOException;
import java.security.KeyStore;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.ConnectionSpec;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.TlsVersion;

public class ApiClient {

    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    private static ApiClient instance;
    private final OkHttpClient client;
    private final ExecutorService executor = Executors.newFixedThreadPool(3);
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public interface ApiCallback {
        void onSuccess(ScanResult result);
        void onError(String errorMessage, int statusCode);
    }

    public interface ConnectionTestCallback {
        void onResult(boolean success, String message);
    }

    public interface LiveCountsCallback {
        void onCounts(int total, int vip, int standard);
    }

    private ApiClient() {
        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS);

        // Enable modern TLS 1.2 on Android 5.0+ (Lollipop API 21/22)
        try {
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init((KeyStore) null);
            TrustManager[] trustManagers = tmf.getTrustManagers();
            if (trustManagers.length >= 1 && trustManagers[0] instanceof X509TrustManager) {
                X509TrustManager x509TrustManager = (X509TrustManager) trustManagers[0];
                SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
                sslContext.init(null, new TrustManager[]{x509TrustManager}, null);
                SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

                builder.sslSocketFactory(sslSocketFactory, x509TrustManager);

                ConnectionSpec spec = new ConnectionSpec.Builder(ConnectionSpec.MODERN_TLS)
                        .tlsVersions(TlsVersion.TLS_1_2, TlsVersion.TLS_1_3)
                        .build();

                builder.connectionSpecs(Arrays.asList(spec, ConnectionSpec.CLEARTEXT));
            }
        } catch (Exception e) {
            // Fallback to default TLS
        }

        // Automatic redirect handler for HTTP 307 / 308 (e.g. Vercel domain alias canonicalization)
        builder.addInterceptor(chain -> {
            Request originalRequest = chain.request();
            Response response = chain.proceed(originalRequest);
            int code = response.code();
            if (code == 301 || code == 302 || code == 307 || code == 308) {
                String location = response.header("Location");
                if (location != null && !location.isEmpty()) {
                    response.close();
                    Request.Builder redirectBuilder = originalRequest.newBuilder().url(location);
                    return chain.proceed(redirectBuilder.build());
                }
            }
            return response;
        });

        this.client = builder.build();
    }

    public static synchronized ApiClient getInstance() {
        if (instance == null) {
            instance = new ApiClient();
        }
        return instance;
    }

    private String normalizeUrl(String url) {
        String clean = url.trim();
        if (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
            clean = "https://" + clean;
        }
        if (clean.contains("pubg-ethiopia.vercel.app")) {
            clean = clean.replace("pubg-ethiopia.vercel.app", "pubgmethiopia.vercel.app");
        }
        return clean;
    }

    public void checkInTicket(String serverUrl, String ticketPayload, String staffName, String secretKey, ApiCallback callback) {
        executor.execute(() -> {
            try {
                String cleanBaseUrl = normalizeUrl(serverUrl);
                String endpoint = cleanBaseUrl + "/api/scanner/check-in";

                JSONObject json = new JSONObject();
                json.put("ticket", ticketPayload.trim());
                json.put("staffName", staffName);
                json.put("secretKey", secretKey);

                RequestBody body = RequestBody.create(JSON, json.toString());
                Request request = new Request.Builder()
                        .url(endpoint)
                        .post(body)
                        .addHeader("x-scanner-key", secretKey)
                        .addHeader("x-staff-name", staffName)
                        .build();

                client.newCall(request).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        mainHandler.post(() -> callback.onError("Network connection failure: " + e.getMessage(), 0));
                    }

                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        String responseBody = response.body() != null ? response.body().string() : "";
                        int statusCode = response.code();

                        mainHandler.post(() -> {
                            try {
                                JSONObject resJson = new JSONObject(responseBody);
                                ScanResult result = new ScanResult();
                                result.status = resJson.optString("status", statusCode == 200 ? "SUCCESS" : "ERROR");
                                result.message = resJson.optString("message", resJson.optString("error", "Unknown server response"));

                                JSONObject regObj = resJson.optJSONObject("registration");
                                if (regObj != null) {
                                    result.fullName = regObj.optString("fullName", "N/A");
                                    result.inGameName = regObj.optString("inGameName", "N/A");
                                    result.pubgUid = regObj.optString("pubgUid", "N/A");
                                    result.ticketTier = regObj.optString("ticketTier", "STANDARD");
                                    result.referenceId = regObj.optString("referenceId", "N/A");
                                    result.category = regObj.optString("category", "Attendee");
                                    result.checkedInAt = regObj.optString("checkedInAt", "Just now");
                                    result.checkedInBy = regObj.optString("checkedInBy", staffName);
                                }

                                // Parse real-time server counters
                                JSONObject countsObj = resJson.optJSONObject("counts");
                                if (countsObj != null) {
                                    result.serverTotalCount = countsObj.optInt("total", -1);
                                    result.serverVipCount = countsObj.optInt("vip", -1);
                                    result.serverStandardCount = countsObj.optInt("standard", -1);
                                }

                                if (statusCode == 200) {
                                    callback.onSuccess(result);
                                } else if (statusCode == 409) { // Already checked in
                                    result.status = "ALREADY_CHECKED_IN";
                                    callback.onSuccess(result);
                                } else if (statusCode == 403) { // VIP Unapproved
                                    result.status = "VIP_UNAPPROVED";
                                    callback.onSuccess(result);
                                } else if (statusCode == 404) { // Invalid / Counterfeit
                                    result.status = "INVALID";
                                    callback.onSuccess(result);
                                } else {
                                    callback.onError(result.message, statusCode);
                                }
                            } catch (Exception parseEx) {
                                callback.onError("Server returned invalid response (HTTP " + statusCode + ")", statusCode);
                            }
                        });
                    }
                });

            } catch (Exception ex) {
                mainHandler.post(() -> callback.onError("Request creation error: " + ex.getMessage(), 0));
            }
        });
    }

    public void fetchLiveGateCounts(String serverUrl, String secretKey, LiveCountsCallback callback) {
        executor.execute(() -> {
            try {
                String cleanBaseUrl = normalizeUrl(serverUrl);
                String endpoint = cleanBaseUrl + "/api/admin/gate-monitor?key=" + secretKey;

                Request request = new Request.Builder()
                        .url(endpoint)
                        .addHeader("x-scanner-key", secretKey)
                        .addHeader("Cache-Control", "no-cache")
                        .get()
                        .build();

                client.newCall(request).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        // Keep local cache if offline
                    }

                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        if (response.isSuccessful()) {
                            String body = response.body() != null ? response.body().string() : "";
                            try {
                                JSONObject json = new JSONObject(body);
                                JSONObject metrics = json.optJSONObject("metrics");
                                if (metrics != null) {
                                    int total = metrics.optInt("totalCheckedIn", 0);
                                    int vip = metrics.optInt("vipCheckedIn", 0);
                                    int standard = metrics.optInt("standardCheckedIn", 0);
                                    mainHandler.post(() -> callback.onCounts(total, vip, standard));
                                }
                            } catch (Exception ignored) {
                            }
                        }
                    }
                });
            } catch (Exception ignored) {
            }
        });
    }

    public void testConnection(String serverUrl, String secretKey, ConnectionTestCallback callback) {
        executor.execute(() -> {
            try {
                String cleanBaseUrl = normalizeUrl(serverUrl);
                String endpoint = cleanBaseUrl + "/api/settings";

                Request request = new Request.Builder()
                        .url(endpoint)
                        .get()
                        .build();

                client.newCall(request).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        mainHandler.post(() -> callback.onResult(false, "Cannot reach server: " + e.getMessage()));
                    }

                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        boolean ok = response.isSuccessful();
                        mainHandler.post(() -> {
                            if (ok) {
                                callback.onResult(true, "Connected successfully to PMCA Command Center!");
                            } else {
                                callback.onResult(false, "Server replied with HTTP " + response.code());
                            }
                        });
                    }
                });

            } catch (Exception ex) {
                mainHandler.post(() -> callback.onResult(false, "Malformed URL: " + ex.getMessage()));
            }
        });
    }
}
