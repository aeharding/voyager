package app.vger.voyager;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.webkit.URLUtil;

import com.getcapacitor.BridgeActivity;

import java.util.Objects;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        if (Objects.equals(intent.getAction(), Intent.ACTION_SEND)) {
            var newIntent = new Intent(Intent.ACTION_VIEW);
            var potentialUrl = intent.getStringExtra(Intent.EXTRA_TEXT);

            if (!URLUtil.isValidUrl(potentialUrl) || !Objects.requireNonNull(potentialUrl).startsWith("https://")) {
                new AlertDialog.Builder(bridge.getContext())
                        .setTitle("Unknown share data received")
                        .setMessage("Voyager only accepts URLs to Lemmy content so that you can browse in-app.")
                        .setCancelable(true)
                        .setPositiveButton("OK", null)
                        .show();

                return;
            }

            newIntent.setData(Uri.parse(potentialUrl));

            bridge.onNewIntent(newIntent);
        }
    }
}
