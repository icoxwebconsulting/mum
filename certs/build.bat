gulp &
ionic build android --release &
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android-armv7-release-unsigned.apk mum_key &
FTk5c8PI &
D:\Android\android-sdk\build-tools\23.0.3\zipalign.exe -v 4 android-armv7-release-unsigned.apk mum-app-v1-0-0.apk
