const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('1. Building JS bundle...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('2. Syncing Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  console.log('3. Building Android APK...');
  process.chdir('android');
  const gradleCmd = process.platform === 'win32' ? 'gradlew assembleDebug' : './gradlew assembleDebug';
  execSync(gradleCmd, { stdio: 'inherit' });
  process.chdir('..');

  console.log('4. Copying APK to www directory...');
  fs.copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk', 'www/app-debug.apk');

  console.log('✅ Done! The file www/app-debug.apk is ready.');
  console.log('👉 You can now run "git push" to deploy to Netlify!');
} catch (e) {
  console.error('❌ Build failed:', e.message);
  process.exit(1);
}
