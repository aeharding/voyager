package app.vger.voyager;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.URLUtil;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // https://github.com/ionic-team/capacitor/issues/2840#issuecomment-891093722
        //
        // Use a transparent status bar and nav bar, and place the window behind the status bar
        // and nav bar. Due to a chromium bug, we need to get the height of both bars
        // and add it to the safe area insets. The native plugin is used to get this info.
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=1094366
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setNavigationBarContrastEnforced(true);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            // On older versions of android setDecorFitsSystemWindows doesn't exist yet, but it can
            // be emulated with flags.
            // It still must be P or greater, as that is the min version for getting the insets
            // through the native plugin.
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                            View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            getWindow().setStatusBarColor(0);
            getWindow().setNavigationBarColor(0);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        if (intent.getAction() == Intent.ACTION_SEND) {
            var newIntent = new Intent(Intent.ACTION_VIEW);
            var potentialUrl = intent.getStringExtra(Intent.EXTRA_TEXT);

            if (!URLUtil.isValidUrl(potentialUrl) || !potentialUrl.startsWith("https://")) {
                new AlertDialog.Builder(bridge.getContext())
                        .setTitle("Unknown share data received")
                        .setMessage("Voyager only accepts URLs to Lemmy content so that you can browse in-app.")
                        .setCancelable(true)
                        .setPositiveButton("OK", null)
                        .show();

                return;
            }

            Uri uri = Uri.parse(potentialUrl);

            // Add a timestamp to the URL to let app know it is not stale
            Uri.Builder uriBuilder = uri.buildUpon();
            long currentTime = System.currentTimeMillis() / 1000L;
            uriBuilder.appendQueryParameter("t", String.valueOf(currentTime));
            newIntent.setData(uriBuilder.build());

            bridge.onNewIntent(newIntent);
        }
    }
}
