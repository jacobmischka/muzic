package com.muzic.react.modules.test;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TestModule extends ReactContextBaseJavaModule {
	public TestModule(ReactApplicationContext reactContext) {
		super(reactContext);
	}

	@Override
	public String getName() {
		return "TestExample";
	}

	@ReactMethod
	public void test() {
		System.out.println("Hm");
	}
}
