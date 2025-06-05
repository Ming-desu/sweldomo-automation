import { env } from "./envConfig";

// Helpers to check current time
export function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function getActionType(state: { timeInDone: boolean; timeOutDone: boolean }): 'TIME_IN' | 'TIME_OUT' | null {
  const now = getCurrentMinutes();
  const inMinutes = parseTimeToMinutes(env.TIME_IN);
  const outMinutes = parseTimeToMinutes(env.TIME_OUT);

  if (!state.timeInDone && now >= inMinutes && now < outMinutes) return 'TIME_IN';
  if (!state.timeOutDone && now >= outMinutes && now <= outMinutes + 30) return 'TIME_OUT';
  return null;
}

export async function waitForNextAction(state: { timeInDone: boolean; timeOutDone: boolean }): Promise<'TIME_IN' | 'TIME_OUT'> {
  let action: 'TIME_IN' | 'TIME_OUT' | null = null;
  while ((action = getActionType(state)) === null) {
    const now = new Date();
    console.log(`[${now.toLocaleTimeString()}] Not yet time for ${state.timeInDone ? 'TIME_OUT' : 'TIME_IN'}. Waiting...`);
    await new Promise(resolve => setTimeout(resolve, 60 * 1000 * 10)); // check every minute
  }
  console.log(`✅ It's time to perform: ${action}`);
  return action;
}

export async function safeClose(target: { close: () => Promise<void> }, label: string) {
  try {
    await Promise.race([
      target.close(),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} close timeout`)), 5000)),
    ]);
  } catch (err: any) {
    console.warn(`⚠️ ${label} did not close cleanly:`, err.message);
  }
}