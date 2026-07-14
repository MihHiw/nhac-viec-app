const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('1. Building Next.js Web App...');
  process.chdir('web');
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir('..');

  console.log('2. Copying Next.js output to www...');
  if (fs.existsSync('www')) {
    fs.rmSync('www', { recursive: true, force: true });
  }
  fs.cpSync('web/out', 'www', { recursive: true });

  console.log('3. Syncing Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  console.log('3.5 Fixing Android startup page...');
  const androidIndex = 'android/app/src/main/assets/public/index.html';
  if (fs.existsSync(androidIndex)) {
    // Thêm timestamp để ép Android WebView không dùng cache cũ
    fs.writeFileSync(androidIndex, '<script>window.location.replace("app/index.html?v=" + Date.now());</script>');
  }

  console.log('4. Building Android APK...');
  process.chdir('android');
  const gradleCmd = process.platform === 'win32' ? 'gradlew assembleDebug' : './gradlew assembleDebug';
  execSync(gradleCmd, { stdio: 'inherit' });
  process.chdir('..');

  console.log('5. Build complete! APK is located at: android/app/build/outputs/apk/debug/app-debug.apk');
  // Removed copying APK to www/ to avoid Cloudflare 25MB limit.

  console.log('✅ Done! The Next.js static site and app-debug.apk are ready.');
  console.log('👉 You can now run "git push" to deploy to Cloudflare Pages!');
} catch (e) {
  console.error('❌ Build failed:', e.message);
  process.exit(1);
}
