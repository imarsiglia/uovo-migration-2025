package com.uovo

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.bridge.ReactApplicationContext

class NavigationAppsPackage : ReactPackage {
  override fun createViewManagers(reactContext: ReactApplicationContext)
    = emptyList<ViewManager<*, *>>()

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(NavigationAppsModule(reactContext))
}
