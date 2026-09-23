package com.teno.eliverter;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

/**
 * Hosts the Go conversion service as a child process and shows its UI.
 *
 * The server binary ships in jniLibs under a lib*.so name so Android extracts it
 * into nativeLibraryDir - the only app-owned location that stays executable on
 * Android 10 and later. FFmpeg is packaged the same way.
 */
public final class MainActivity extends Activity {

    private static final String TAG = "Eliverter";
    private static final String URL_PREFIX = "ELIVERTER_URL ";
    private static final int PICK_FILE = 4201;

    private Process server;
    private WebView web;
    private ProgressBar spinner;
    private String baseUrl = "";
    private ValueCallback<Uri[]> pendingUpload;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.main);
        web = findViewById(R.id.web);
        spinner = findViewById(R.id.spinner);

        configureWebView();
        startServerAndLoad();
    }

    @SuppressWarnings("SetJavaScriptEnabled")
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // A shared file arrives while the UI is already up; hand it to the page.
        if (baseUrl.isEmpty() || intent.getAction() == null) return;
        Uri stream = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (stream != null) {
            final String target = baseUrl + "/?shared=" + Uri.encode(stream.toString());
            runOnUiThread(() -> web.loadUrl(target));
        }
    }

    private void configureWebView() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setSupportZoom(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                spinner.setVisibility(View.GONE);
            }

            /**
             * Anything that is not the local converter belongs to a browser.
             * Loading it in place would navigate the app away from the only URL
             * it can talk to, leaving a blank WebView with no way back.
             */
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri url = req.getUrl();
                String href = url == null ? "" : url.toString();
                if (baseUrl.isEmpty() || href.startsWith(baseUrl)) return false;
                if (!href.startsWith("http://") && !href.startsWith("https://")) return true;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                } catch (ActivityNotFoundException e) {
                    toast("Nothing on this phone can open that link");
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int code, String desc, String failing) {
                Log.e(TAG, "webview " + code + " " + desc + " " + failing);
                spinner.setVisibility(View.GONE);
                toast("The converter did not come back: " + desc);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view,
                                             ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                pendingUpload = callback;
                Intent intent = params.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                // No MIME filter: Eliverter accepts exotic extensions a browser
                // picker would hide.
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(intent, PICK_FILE);
                } catch (Exception error) {
                    pendingUpload = null;
                    toast("No file picker on this device");
                }
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });

        web.setDownloadListener((url, userAgent, contentDisposition, mimetype, length) ->
                saveToDownloads(url, filenameFrom(url, contentDisposition)));
    }

    /** Boots the Go process and points the WebView at whatever port it bound. */
    private void startServerAndLoad() {
        spinner.setVisibility(View.VISIBLE);
        new Thread(() -> {
            try {
                String url = launchServer(getApplicationInfo().nativeLibraryDir);
                if (url == null) {
                    return;
                }
                baseUrl = url;
                final String target = url + "/";
                runOnUiThread(() -> web.loadUrl(target));
            } catch (Exception error) {
                post("could not start the converter: " + error.getMessage());
            }
        }, "eliverter-launch").start();
    }

    /**
     * Starts the Go process and returns its base URL.
     *
     * The child's stdout must be drained for its whole lifetime. If the reader
     * closes the pipe, the next thing the server writes gets EPIPE, and the Go
     * runtime deliberately dies on SIGPIPE for fd 1/2 - which looked like the
     * server crashing on startup until it was traced back to this pipe.
     */
    private String launchServer(String libDir) throws IOException, InterruptedException {
        File serverBin = new File(libDir, "libeliverter_srv.so");
        File ffmpeg = new File(libDir, "libffmpeg_cli.so");
        File ffprobe = new File(libDir, "libffprobe_cli.so");

        if (!serverBin.canExecute()) {
            post("server binary is not executable: " + serverBin);
            return null;
        }

        File data = new File(getNoBackupFilesDir(), "eliverter");
        //noinspection ResultOfMethodCallIgnored
        data.mkdirs();

        ArrayList<String> cmd = new ArrayList<>();
        cmd.add(serverBin.getAbsolutePath());
        cmd.add("-addr");
        cmd.add("127.0.0.1:0");
        cmd.add("-data");
        cmd.add(data.getAbsolutePath());
        // One worker keeps a mid-range phone usable while an encode runs.
        cmd.add("-workers");
        cmd.add("1");

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(getCacheDir());
        pb.redirectErrorStream(true);
        if (ffmpeg.canRead()) {
            pb.environment().put("ELI_FFMPEG", ffmpeg.getAbsolutePath());
        }
        if (ffprobe.canRead()) {
            pb.environment().put("ELI_FFPROBE", ffprobe.getAbsolutePath());
        }
        Process proc = pb.start();
        server = proc;

        final Object ready = new Object();
        final String[] found = new String[1];

        Thread pump = new Thread(() -> {
            try (BufferedReader reader =
                         new BufferedReader(new InputStreamReader(proc.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    Log.d(TAG, line);
                    if (found[0] == null && line.startsWith(URL_PREFIX)) {
                        synchronized (ready) {
                            found[0] = line.substring(URL_PREFIX.length()).trim();
                            ready.notifyAll();
                        }
                    }
                }
            } catch (IOException ignored) {
                // The process is going away; the watcher below reports it.
            }
        }, "eliverter-stdout");
        pump.setDaemon(true);
        pump.start();

        long deadline = System.currentTimeMillis() + 20_000;
        synchronized (ready) {
            while (found[0] == null && System.currentTimeMillis() < deadline) {
                ready.wait(Math.max(1, deadline - System.currentTimeMillis()));
            }
        }

        if (found[0] == null) {
            int code = -1;
            try {
                code = proc.waitFor();
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
            post("the converter exited before it was ready (code " + code +
                    "); is FFmpeg packaged?");
            return null;
        }
        return found[0];
    }

    private void saveToDownloads(String url, String name) {
        try {
            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
            req.allowScanningByMediaScanner();
            req.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            dm.enqueue(req);
            toast("Saving " + name + " to Downloads");
        } catch (Exception error) {
            post("could not save: " + error.getMessage());
        }
    }

    private static String filenameFrom(String url, String disposition) {
        String name = URLUtil.guessFileName(url, disposition, null);
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        return slash >= 0 ? name.substring(slash + 1) : name;
    }

    @Override
    protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code != PICK_FILE || pendingUpload == null) return;
        ValueCallback<Uri[]> callback = pendingUpload;
        pendingUpload = null;
        if (result != RESULT_OK || data == null) {
            callback.onReceiveValue(null);
            return;
        }
        Uri picked = data.getData();
        if (picked != null) {
            callback.onReceiveValue(new Uri[]{picked});
            return;
        }
        if (data.getClipData() != null) {
            int count = data.getClipData().getItemCount();
            Uri[] uris = new Uri[count];
            for (int i = 0; i < count; i++) {
                uris[i] = data.getClipData().getItemAt(i).getUri();
            }
            callback.onReceiveValue(uris);
            return;
        }
        callback.onReceiveValue(null);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) {
            web.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (server != null) {
            server.destroy();
            server = null;
        }
        super.onDestroy();
    }

    private void post(String message) {
        Log.e(TAG, message);
        runOnUiThread(() -> toast(message));
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
