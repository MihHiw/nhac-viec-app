package com.borny.nhacoi;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

@CapacitorPlugin(name = "BackgroundTts")
public class BackgroundTtsPlugin extends Plugin {

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray tasks = call.getArray("tasks");
        if (tasks == null) {
            call.reject("Must provide tasks array");
            return;
        }

        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        try {
            List<Object> list = tasks.toList();
            for (int i = 0; i < list.size(); i++) {
                JSONObject t = (JSONObject) list.get(i);
                int id = t.getInt("id");
                String text = t.getString("text");
                long at = t.getLong("at");
                int repeats = t.optInt("repeats", 1); // default to 1
                int volume = t.optInt("volume", 100);

                Intent intent = new Intent(context, TtsReceiver.class);
                intent.putExtra("id", id);
                intent.putExtra("text", text);
                intent.putExtra("repeats", repeats);
                intent.putExtra("volume", volume);

                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }

                PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, intent, flags);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingIntent);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, at, pendingIntent);
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, at, pendingIntent);
                }
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Invalid tasks format", e);
        }
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        JSArray ids = call.getArray("ids");
        if (ids != null) {
             Context context = getContext();
             AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
             try {
                 List<Object> list = ids.toList();
                 for (int i = 0; i < list.size(); i++) {
                     int id = (int) list.get(i);
                     Intent intent = new Intent(context, TtsReceiver.class);
                     int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                         flags |= PendingIntent.FLAG_IMMUTABLE;
                     }
                     PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, intent, flags);
                     alarmManager.cancel(pendingIntent);
                 }
                 call.resolve();
             } catch(Exception e) {
                 call.reject("Error", e);
             }
        } else {
             call.resolve();
        }
    }
}
