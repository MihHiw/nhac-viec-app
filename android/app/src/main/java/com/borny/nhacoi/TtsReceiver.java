package com.borny.nhacoi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
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
        int repeats = intent.getIntExtra("repeats", 1);
        if (text == null || text.isEmpty()) return;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        // Acquire wake lock to keep CPU running during TTS
        long wakeTime = (repeats * 10 * 1000L) + 10000L;
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NhacViec::TtsWakeLock");
        wakeLock.acquire(wakeTime);

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
                        if (utteranceId.equals("MessageId_" + (repeats - 1))) {
                            releaseResources();
                        }
                    }

                    @Override
                    public void onError(String utteranceId) {
                        releaseResources();
                    }
                });

                String fullText = "Xin thông báo! " + text;
                
                for (int i = 0; i < repeats; i++) {
                    HashMap<String, String> p = new HashMap<>();
                    p.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "MessageId_" + i);
                    tts.speak(fullText, i == 0 ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, p);
                    
                    if (i < repeats - 1 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        tts.playSilentUtterance(3000, TextToSpeech.QUEUE_ADD, "SilenceId_" + i);
                    }
                }
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
