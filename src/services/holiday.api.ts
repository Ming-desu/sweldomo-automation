import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

interface Holiday {
  date: string;
  occasion: string;
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const currentYear = new Date().getFullYear();
const filePath = path.resolve(__dirname, 'holidays', `${currentYear}.json`);

export async function extractHolidaysWithPuppeteer() {
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const holidays = JSON.parse(fileContents) as Holiday[];
    return holidays;
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(`https://www.officialgazette.gov.ph/nationwide-holidays/${currentYear}/`, {
    waitUntil: 'networkidle0',
  });

  const html = await page.content();
  const $ = cheerio.load(html);
  const holidays: Holiday[] = [];

  $('table').each((_, table) => {
    $(table).find('tr').each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 2) {
        const occasion = $(cols[0]).text().trim();
        const date = $(cols[1]).find('abbr').attr('title')?.trim() || $(cols[1]).text().trim();
        if (date && occasion) {
          holidays.push({ date, occasion });
        }
      }
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(holidays, null, 2), 'utf-8');
  browser.close();
  return holidays;
}
