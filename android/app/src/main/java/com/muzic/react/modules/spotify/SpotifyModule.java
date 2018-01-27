package com.muzic.react.modules.spotify;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.spotify.sdk.android.authentication.AuthenticationClient;
import com.spotify.sdk.android.authentication.AuthenticationRequest;
import com.spotify.sdk.android.authentication.AuthenticationResponse;
import com.spotify.sdk.android.player.Config;
import com.spotify.sdk.android.player.ConnectionStateCallback;
import com.spotify.sdk.android.player.Error;
import com.spotify.sdk.android.player.Metadata;
import com.spotify.sdk.android.player.PlaybackState;
import com.spotify.sdk.android.player.Player;
import com.spotify.sdk.android.player.PlayerEvent;
import com.spotify.sdk.android.player.Spotify;
import com.spotify.sdk.android.player.SpotifyPlayer;

// FIXME: This currently will not work at all with react native, I just wanted
// to get the spotify boilerplate added

public class SpotifyModule extends ReactContextBaseJavaModule {
	private static final String CLIENT_ID = "0aba62895c174ba9b8d077c0edba8ed3";
	private static final String REDIRECT_URI = "redirect://uri"; // FIXME
	private static final int REQUEST_CODE = 42069; // FIXME

	private SpotifyEventListener activityEventListener;

	public SpotifyModule(ReactApplicationContext reactContext) {
		super(reactContext);

		Looper.prepare();
		activityEventListener = new SpotifyEventListener(reactContext);
		reactContext.addActivityEventListener(activityEventListener);
	}

	@Override
	public String getName() {
		return "Spotify";
	}


	@ReactMethod
	public void authenticate() {
		AuthenticationRequest request = new AuthenticationRequest.Builder(
			CLIENT_ID,
			AuthenticationResponse.Type.TOKEN,
			REDIRECT_URI
		).setScopes(new String[]{
			"user-read-private",
			"user-library-read",
			"streaming"
		}).build();

		AuthenticationClient.openLoginActivity(
			getCurrentActivity(),
			REQUEST_CODE,
			request
		);
	}

	@ReactMethod
	public void playUri(String uri, int index, int positionInMs, Callback callback) {
		// TODO: add callback
		if (activityEventListener.player != null) {
			activityEventListener.player.playUri(new SimpleOperationCallback(callback), uri, index, positionInMs);
		} else {
			callback.invoke("Not authenticated");
		}
	}

	@ReactMethod
	public void pause(Callback callback) {
		if (activityEventListener.player != null) {
			activityEventListener.player.pause(
				new SimpleOperationCallback(callback)
			);
		} else {
			callback.invoke("Not authenticated");
		}
	}

	@ReactMethod
	public void resume(Callback callback) {
		if (activityEventListener.player != null) {
			activityEventListener.player.resume(
				new SimpleOperationCallback(callback)
			);
		} else {
			callback.invoke("Not authenticated");
		}
	}

	@ReactMethod
	public void skipToNext(Callback callback) {
		if (activityEventListener.player != null) {
			activityEventListener.player.skipToNext(
				new SimpleOperationCallback(callback)
			);
		} else {
			callback.invoke("Not authenticated");
		}
	}

	@ReactMethod
	public void skipToPrevious(Callback callback) {
		if (activityEventListener.player != null) {
			activityEventListener.player.skipToPrevious(
				new SimpleOperationCallback(callback)
			);
		} else {
			callback.invoke("Not authenticated");
		}
	}

	@ReactMethod
	public void seekToPosition(int positionInMs, Callback callback) {
		if (activityEventListener.player != null) {
			activityEventListener.player.seekToPosition(
				new SimpleOperationCallback(callback),
				positionInMs
			);
		} else {
			callback.invoke("Not authenticated");
		}
	}

	@ReactMethod
	public void getMetadata(Callback callback) {
		if (activityEventListener.player != null) {
			Metadata metadata = activityEventListener.player.getMetadata();
			WritableMap map = SpotifyConversionUtils.metadata(metadata);
			callback.invoke(map, null);
		} else {
			callback.invoke(null, "Not authenticated");
		}
	}

	@ReactMethod
	public void getPlaybackState(Callback callback) {
		if (activityEventListener.player != null) {
			PlaybackState state = activityEventListener.player.getPlaybackState();
			WritableMap map = SpotifyConversionUtils.playbackState(state);
			callback.invoke(map, null);
		} else {
			callback.invoke(null, "Not authenticated");
		}
	}

	class SimpleOperationCallback implements Player.OperationCallback {

		Callback callback;

		public SimpleOperationCallback(Callback callback) {
			this.callback = callback;
		}

		public void onError(Error error) {
			if (callback != null)
				callback.invoke(error.toString());
		}

		public void onSuccess() {
			if (callback != null)
				callback.invoke((Object)null);
		}
	}

	class SpotifyEventListener extends BaseActivityEventListener
				implements SpotifyPlayer.NotificationCallback, ConnectionStateCallback {

		protected ReactContext reactContext;
		protected Player player;

		SpotifyEventListener(ReactContext reactContext) {
			super();

			this.reactContext = reactContext;
		}

		private void sendEvent(String eventName, WritableMap params) {
			reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
				.emit(eventName, params);
		}

		@Override
		public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
			Log.d("SpotifyEventListener", "received event");
			if (requestCode == REQUEST_CODE) {
				AuthenticationResponse response = AuthenticationClient.getResponse(resultCode, intent);
				switch (response.getType()) {
					case TOKEN: {
						String token = response.getAccessToken();
						Log.d("SpotifyEventListener", "token: " + token);
						WritableNativeMap map = new WritableNativeMap();
						map.putString("token", token);
						sendEvent("receivedToken", map);

						Config playerConfig = new Config(reactContext, token, CLIENT_ID);
						Spotify.getPlayer(playerConfig, this, new SpotifyPlayer.InitializationObserver() {
							@Override
							public void onInitialized(SpotifyPlayer spotifyPlayer) {
								player = spotifyPlayer;
								player.addConnectionStateCallback(SpotifyEventListener.this);
								player.addNotificationCallback(SpotifyEventListener.this);
							}

							@Override
							public void onError(Throwable throwable) {
								Log.e("SpotifyEventListener", "Could not initialize player: " + throwable.getMessage());
							}
						});
						break;
					}
					case ERROR: {
						WritableNativeMap map = new WritableNativeMap();
						map.putString("error", response.getError());
						sendEvent("loginFailed", map);
						break;
					}
					default: {
						WritableNativeMap map = new WritableNativeMap();
						map.putString("error", "Unknown");
						sendEvent("loginFailed", map);
						break;
					}
				}
			}
		}

		@Override
		public void onNewIntent(Intent intent) {
			// Nothing to do?
		}

		@Override
		public void onPlaybackError(Error error) {
			// FIXME
			Log.e("SpotifyEventListener", error.toString());
		}

		@Override
		public void onPlaybackEvent(PlayerEvent event) {
			Log.d("SpotifyEventListener", event.toString());
			WritableNativeMap map = new WritableNativeMap();
			map.putString("playbackEvent", event.toString());
			sendEvent("playbackEvent", map);
		}

		@Override
		public void onConnectionMessage(String message) {
			// FIXME
			Log.d("SpotifyEventListener", message);
		}

		@Override
		public void onTemporaryError() {
			// FIXME
			Log.e("SpotifyEventListener", "Temporary error?");
		}

		@Override
		public void onLoggedIn() {
			// TODO: Use event to get back to js
			Log.d("SpotifyEventListener", "User logged in");
			sendEvent("loggedIn", null);
		}

		@Override
		public void onLoggedOut() {
			// TODO: Use event to get back to js
			Log.d("SpotifyEventListener", "User logged out");
			sendEvent("loggedOut", null);
		}

		@Override
		public void onLoginFailed(Error error) {
			// FIXME
			Log.e("SpotifyEventListener", error.toString());
			WritableNativeMap map = new WritableNativeMap();
			map.putString("error", error.toString());
			sendEvent("loginFailed", map);
		}

		// @Override
		// public void onDestroy() {
		// 	Spotify.destroyPlayer(this);
		// 	super.onDestroy();
		// }
	}
}

class SpotifyConversionUtils {
	static WritableMap track(Metadata.Track track) {
		WritableNativeMap map = new WritableNativeMap();
		map.putString("albumCoverWebUrl", track.albumCoverWebUrl);
		map.putString("albumName", track.albumName);
		map.putString("albumUri", track.albumUri);
		map.putString("artistName", track.artistName);
		map.putString("artistUri", track.artistUri);
		map.putInt("durationMs", (int)track.durationMs);
		map.putInt("indexInContext", (int)track.indexInContext);
		map.putString("name", track.name);
		map.putString("uri", track.uri);
		return map;
	}

	static WritableMap metadata(Metadata metadata) {
		WritableNativeMap map = new WritableNativeMap();
		map.putString("contextName", metadata.contextName);
		map.putString("contextUri", metadata.contextUri);
		map.putMap("currentTrack", SpotifyConversionUtils.track(metadata.currentTrack));
		map.putMap("nextTrack", SpotifyConversionUtils.track(metadata.nextTrack));
		map.putMap("prevTrack", SpotifyConversionUtils.track(metadata.prevTrack));
		return map;
	}

	static WritableMap playbackState(PlaybackState playbackState) {
		WritableNativeMap map = new WritableNativeMap();
		map.putBoolean("isActiveDevice", playbackState.isActiveDevice);
		map.putBoolean("isPlaying", playbackState.isPlaying);
		map.putBoolean("isRepeating", playbackState.isRepeating);
		map.putBoolean("isShuffling", playbackState.isShuffling);
		map.putInt("positionMs", (int)playbackState.positionMs);
		return map;
	}
}
