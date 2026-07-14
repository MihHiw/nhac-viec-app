package com.borny.nhacoi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;

import java.util.HashMap;
import java.util.Locale;

public class TtsReceiver extends BroadcastReceiver {

    private TextToSpeech tts;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onReceive(Context context, Intent intent) {
        String text = intent.getStringExtra("text");
        if (text == null || text.isEmpty()) return;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        // Acquire wake lock to keep CPU running during TTS
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NhacViec::TtsWakeLock");
        wakeLock.acquire(60 * 1000L /*60 seconds*/);

        // Optional: Also wake up screen
        PowerManager.WakeLock screenLock = pm.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "NhacViec::ScreenLock"
        );
        screenLock.acquire(10 * 1000L); // 10 seconds

        tts = new TextToSpeech(context.getApplicationContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(new Locale("vi", "VN"));
                
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {
                    }

                    @Override
                    public void onDone(String utteranceId) {
                        releaseResources();
                    }

                    @Override
                    public void onError(String utteranceId) {
                        releaseResources();
                    }
                });

                HashMap<String, String> params = new HashMap<>();
                params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "MessageId");

                String fullText = "Xin thông báo! " + text;
                tts.speak(fullText, TextToSpeech.QUEUE_FLUSH, params);
            } else {
                releaseResources();
            }
        });
        
        if (screenLock.isHeld()) {
            screenLock.release();
        }
    }

    private void releaseResources() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }
    }
}
