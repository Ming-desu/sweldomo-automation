import { chromium } from 'playwright';
import path from 'node:path';

import { env } from './utils/envConfig';
import { safeClose, waitForNextAction } from './utils/helpers';
import { extractHolidaysWithPuppeteer } from './services/holiday.api';

async function launchAndPerformAction(action: 'TIME_IN' | 'TIME_OUT') {
  const browser = await chromium.launch({
    executablePath: chromium.executablePath(),
    headless: false,
    slowMo: 100,
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-video-capture=${path.resolve(import.meta.dirname, './assets/black.y4m')}`
    ],
  });

  const context = await browser.newContext({
    permissions: ['camera', 'geolocation'],
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    timezoneId: 'Asia/Manila',
    geolocation: {
      latitude: env.LATITUDE,
      longitude: env.LONGITUDE,
    },
  });

  await context.grantPermissions(['geolocation', 'camera'], {
    origin: env.BASE_URL,
  });
  const page = await context.newPage();

  await page.goto(env.BASE_URL, { timeout: 0 });

  // Log in user credentials
  const emailInput = page.locator(env.EMAIL_INPUT);
  await emailInput.pressSequentially(env.EMAIL, { delay: 100 });

  await page.waitForTimeout(1000);

  const passwordInput = page.locator(env.PASSWORD_INPUT);
  await passwordInput.pressSequentially(env.PASSWORD, { delay: 100 });

  await page.waitForTimeout(1000);
  await page.click(env.IAGREE);

  await page.waitForTimeout(1000);
  await page.click(env.LOG_IN_BUTTON);

  // Proceed to DTR
  await page.click(env.OPEN_FACE_DTR);

  await page.waitForURL(`${env.BASE_URL}/employees/facedtr`);

  await page.locator(env.TIME_MODAL_TRIGGER).waitFor({ state: 'visible' });
  await page.click(env.TIME_MODAL_TRIGGER);

  await page.waitForSelector(env.TIME_MODAL, {
    state: 'visible',
    timeout: 5000,
  });

  if (action === 'TIME_IN') {
    await page.locator(env.TIME_IN_BUTTON).waitFor({ state: 'visible' });
    await page.click(env.TIME_IN_BUTTON);

    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const button = document.querySelector(env.CAPTURE_BUTTON) as HTMLDivElement | null;

      if (button?.checkVisibility()) {
        button.click();
      }
    })
  } else if (action === 'TIME_OUT') {
    await page.locator(env.TIME_OUT_BUTTON).waitFor({ state: 'visible' });
    await page.click(env.TIME_OUT_BUTTON);
    await page.locator(env.CAPTURE_BUTTON).waitFor({ state: 'visible' });
    await page.click(env.CAPTURE_BUTTON);

    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const dup = document.querySelector('div.row.dup_keys div#dup-yes') as HTMLDivElement | null;

      if (dup?.checkVisibility()) {
        dup.click();
      }
    })
  }

  await page.waitForTimeout(1000);
  await page.goto(`${env.BASE_URL}/logout`);
  await page.waitForURL(`${env.BASE_URL}/login`);
  await page.waitForTimeout(1000);

  // await context.close();
  // await browser.close();
  await safeClose(context, 'Context');
  await safeClose(browser, 'Browser');
}

// --- Main Execution ---
const state = {
  timeInDone: false,
  timeOutDone: false,
};

const JS_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EXCLUDED_DAYS = ['Saturday', 'Sunday'];
const PH_HOLIDAYS = await extractHolidaysWithPuppeteer();
const PH_HOLIDAYS_MAP = new Map(PH_HOLIDAYS.map((value) => {
  const [dateMonth] = value.date.split(', ');
  return [dateMonth, value.occasion];
}))

const currentDate = new Date();
const currentDay = JS_DAYS[currentDate.getDay()];
const currentMonth = JS_MONTHS[currentDate.getMonth()];

async function main() {
  // Check if days excluded
  if (EXCLUDED_DAYS.includes(currentDay)) {
    console.warn(`⚠️ Today is ${currentDay}. Skipping...`);
    return;
  }

  const holiday = PH_HOLIDAYS_MAP.get(`${currentMonth} ${currentDate.getDate()}`);

  if (holiday) {
    console.warn(`⚠️ Today is ${holiday}. Skipping...`);
    return;
  }

  while (!state.timeInDone || !state.timeOutDone) {
    const nextAction = await waitForNextAction(state);
    await launchAndPerformAction(nextAction);
    if (nextAction === 'TIME_IN') state.timeInDone = true;
    if (nextAction === 'TIME_OUT') state.timeOutDone = true;
  }

  process.exit(0);
}

main();
