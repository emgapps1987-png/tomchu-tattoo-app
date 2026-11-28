package com.tomchutattoo.app;

import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

/** פותח את הצ'אט של תום בוואטסאפ עם התמונה מצורפת (בלי תפריט שיתוף כללי). */
@CapacitorPlugin(name = "WaShare")
public class WaSharePlugin extends Plugin {
  @PluginMethod
  public void share(PluginCall call) {
    String path = call.getString("path");
    String phone = call.getString("phone", "");
    String text = call.getString("text", "");
    if (path == null) { call.reject("no_path"); return; }
    try {
      Uri src = Uri.parse(path);
      File f = new File(src.getPath() != null ? src.getPath() : path);
      Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
      for (String pkg : new String[] { "com.whatsapp", "com.whatsapp.w4b" }) {
        Intent i = new Intent(Intent.ACTION_SEND);
        i.setType("image/jpeg");
        i.setPackage(pkg);
        i.putExtra(Intent.EXTRA_STREAM, uri);
        if (!text.isEmpty()) i.putExtra(Intent.EXTRA_TEXT, text);
        if (!phone.isEmpty()) i.putExtra("jid", phone + "@s.whatsapp.net");
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try { getContext().startActivity(i); call.resolve(); return; } catch (ActivityNotFoundException e) { /* try next */ }
      }
      call.reject("no_whatsapp");
    } catch (Exception e) {
      call.reject(String.valueOf(e.getMessage()));
    }
  }

  /** שמירה ישירה לגלריה: Pictures/Tomchu Tattoo (אנדרואיד 10 ומעלה, בלי הרשאות). */
  @PluginMethod
  public void saveImage(PluginCall call) {
    String path = call.getString("path");
    String name = call.getString("name", "Tomchu-" + System.currentTimeMillis() + ".jpg");
    if (path == null) { call.reject("no_path"); return; }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) { call.reject("old_android"); return; }
    try {
      Uri src = Uri.parse(path);
      File f = new File(src.getPath() != null ? src.getPath() : path);
      ContentResolver cr = getContext().getContentResolver();
      ContentValues v = new ContentValues();
      v.put(MediaStore.Images.Media.DISPLAY_NAME, name);
      v.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
      v.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Tomchu Tattoo");
      v.put(MediaStore.Images.Media.IS_PENDING, 1);
      Uri dst = cr.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
      if (dst == null) { call.reject("insert_failed"); return; }
      try (InputStream in = new FileInputStream(f); OutputStream out = cr.openOutputStream(dst)) {
        byte[] buf = new byte[16384]; int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
      }
      v.clear(); v.put(MediaStore.Images.Media.IS_PENDING, 0); cr.update(dst, v, null, null);
      call.resolve();
    } catch (Exception e) {
      call.reject(String.valueOf(e.getMessage()));
    }
  }
}
