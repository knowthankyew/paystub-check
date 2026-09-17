import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const repoRoot = path.resolve(__dirname, '..');
  const tempVideoDir = path.join(repoRoot, '.temp_demo_videos');
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

  const destMp4 = path.join(repoRoot, 'demo.mp4');
  const destGif = path.join(repoRoot, 'demo.gif');

  const activeUrl = 'http://127.0.0.1:3000';

  console.log(`🎬 Launching Playwright browser for PaystubCheck demo against ${activeUrl}...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1366,860'],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 860 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1366, height: 860 },
    },
  });

  const page = await context.newPage();

  console.log(`Step 1: Navigating to PaystubCheck UI (${activeUrl})...`);
  await page.goto(activeUrl, { waitUntil: 'networkidle' });
  await sleep(1500);

  console.log('Step 2: Showcasing 100% Offline & Private Badge...');
  await page.hover('text=100% Offline & Private');
  await sleep(1000);

  console.log('Step 3: Hovering and selecting Salaried Misclassification Sample Preset...');
  await page.hover('.relative.group');
  await sleep(800);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const salaryBtn = btns.find(b => b.textContent && b.textContent.includes('Salaried Misclassification'));
    if (salaryBtn) salaryBtn.click();
  });
  await sleep(1200);

  console.log('Step 4: Running FLSA Wage & Hour Reality Check...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const analyzeBtn = btns.find(b => b.textContent && b.textContent.includes('Analyze Pay Stub'));
    if (analyzeBtn) analyzeBtn.click();
  });
  await sleep(1500);

  console.log('Step 5: Inspecting Compliance Score & FLSA Exemption Badges...');
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 6: Switching to Red Flags Tab to inspect 29 U.S.C. § 213(a)(1) Exemption Threshold...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const rfBtn = btns.find(b => b.textContent && b.textContent.includes('Red Flags'));
    if (rfBtn) rfBtn.click();
  });
  await sleep(1500);
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 7: Changing Jurisdiction to Massachusetts (MA)...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(600);
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const stateSelect = selects.find(s => s.options && Array.from(s.options).some(o => o.value === 'MA'));
    if (stateSelect) {
      stateSelect.value = 'MA';
      stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1200);

  console.log('Step 8: Inspecting Massachusetts Mandatory Treble Damages (M.G.L. c. 149 § 148)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const maBtn = btns.find(b => b.textContent && b.textContent.includes('Massachusetts Wage Laws'));
    if (maBtn) maBtn.click();
  });
  await sleep(1800);
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 9: Generating Statutory Wage Claim Demand Letter...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const demandBtn = btns.find(b => b.textContent && b.textContent.includes('Draft Demand Letter'));
    if (demandBtn) demandBtn.click();
  });
  await sleep(1200);

  const inputs = await page.locator('input[type="text"]');
  if (await inputs.count() >= 3) {
    await inputs.nth(0).fill('Alex Rivera');
    await sleep(300);
    await inputs.nth(1).fill('742 Evergreen Terr, Boston, MA 02108');
    await sleep(300);
    await inputs.nth(2).fill('alex.rivera@example.com');
    await sleep(300);
  }

  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 10: Copying Demand Notice to Clipboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const copyBtn = btns.find(b => b.textContent && b.textContent.includes('Copy Letter'));
    if (copyBtn) copyBtn.click();
  });
  await sleep(1500);

  console.log('Step 11: Exporting Full Analysis Report...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exportBtn = btns.find(b => b.textContent && b.textContent.includes('Export Report'));
    if (exportBtn) exportBtn.click();
  });
  await sleep(2000);

  console.log('Closing browser context to finalize video recording...');
  await page.close();
  await context.close();
  await browser.close();
  await sleep(1500);

  // Locate recorded WebM
  const videoFiles = fs.readdirSync(tempVideoDir).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length === 0) {
    console.error('❌ Error: No recorded WebM video found in temp folder.');
    return;
  }

  const latestVideo = path.join(tempVideoDir, videoFiles[videoFiles.length - 1]);

  const candidateFfmpeg = [
    '/Users/cl0rkster/Dev/ml/src/FtaaSService.Worker/.venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1',
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    'ffmpeg',
  ];

  let ffmpegPath = null;
  for (const p of candidateFfmpeg) {
    if (fs.existsSync(p)) {
      ffmpegPath = p;
      break;
    }
  }

  if (ffmpegPath) {
    try {
      console.log(`🎬 Transcoding recording to web-standard MP4 via ${ffmpegPath}...`);
      execSync(`"${ffmpegPath}" -y -i "${latestVideo}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${destMp4}"`, { stdio: 'inherit' });
      const stats = fs.statSync(destMp4);
      console.log(`✓ Demo MP4 generated: ${destMp4} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

      console.log('🎬 Transcoding animated preview GIF for GitHub README...');
      execSync(`"${ffmpegPath}" -y -i "${destMp4}" -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${destGif}"`, { stdio: 'inherit' });
      const gifStats = fs.statSync(destGif);
      console.log(`✓ Demo GIF generated: ${destGif} (${(gifStats.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (err) {
      console.warn('⚠️ FFmpeg conversion warning, keeping WebM:', err.message);
      fs.copyFileSync(latestVideo, destMp4);
    }
  } else {
    console.warn('⚠️ FFmpeg binary not found. Retaining raw WebM as demo.mp4.');
    fs.copyFileSync(latestVideo, destMp4);
  }

  // Clean up temp dir
  fs.rmSync(tempVideoDir, { recursive: true, force: true });
  console.log('✨ Demo video recording complete!');
})();
