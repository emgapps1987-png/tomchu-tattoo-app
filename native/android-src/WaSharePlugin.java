package com.tomchutattoo.app;

import android.content.ActivityNotFoundException;
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
}
