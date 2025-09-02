package com.uovo

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*

class NavigationAppsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "NavigationApps"

  @ReactMethod
  fun openGeoChooser(lat: Double, lng: Double, label: String?, promise: Promise) {
    try {
      val uri = if (label != null && label.isNotBlank())
        Uri.parse("geo:$lat,$lng?q=$lat,$lng(${Uri.encode(label)})")
      else
        Uri.parse("geo:$lat,$lng?q=$lat,$lng")

      val intent = Intent(Intent.ACTION_VIEW, uri)
      val chooser = Intent.createChooser(intent, "Open with")
      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(chooser)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_OPEN_CHOOSER", e)
    }
  }
}
