import { expect, test, type Page } from '@playwright/test';
import type { GameState } from '../../src/game/state';

declare global {
  interface Window {
    gns: { getState: () => GameState; update: (f: (d: GameState) => void) => void };
  }
}

// A fresh room per test so a stale question from another test can't leak in.
const room = () => 'T' + Math.random().toString(36).slice(2, 5).toUpperCase().replace(/[^A-Z0-9]/g, 'X').padEnd(3, 'X');

async function startBoard(page: Page, code: string, round = 'Round 1: The Classics') {
  await page.goto(`/?room=${code}`);
  for (const name of ['Alpha', 'Bravo']) {
    await page.getByPlaceholder('Team or player name').fill(name);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Start Game' }).click();
  await page.getByRole('button', { name: new RegExp(round.replace(/[().]/g, '\\$&')) }).click();
  if (round !== 'Round 9: The Reckoning') await page.getByRole('button', { name: /^Play \(/ }).click();
  await expect(page.locator('#board')).toBeVisible();
}

/** Takes the randomness out of the board: no wildcards, Daily Double where we say. */
async function rig(page: Page, dd: { category: string; value: number } | null = null) {
  await page.evaluate(dd => window.gns.update(d => { d.wild = {}; d.dd = dd; }), dd);
}

const score = (page: Page, team: string) => page.locator('#scoreboard .score-chip', { hasText: team }).locator('.pts');
const firstSquare = async (page: Page) => {
  const cell = page.locator('.cell.clickable').first();
  return { cell, cat: (await cell.getAttribute('data-cat'))!, val: Number(await cell.getAttribute('data-val')) };
};

test('a question: reveal, award, and the pick moves to whoever got it', async ({ page }) => {
  await startBoard(page, room());
  await rig(page);
  const { cell, cat, val } = await firstSquare(page);
  await cell.click();
  await expect(page.locator('#overlay .tag')).toHaveText(`${cat} — ${val} pts`);
  await page.keyboard.press('Space'); // reveal
  await expect(page.locator('#overlay .atext')).toBeVisible();
  await page.locator('#overlay [data-prefix="award"]', { hasText: 'Bravo' }).click();
  await expect(page.locator('#overlay')).toHaveCount(0);
  await expect(score(page, 'Bravo')).toHaveText(String(val));
  await expect(page.locator('.reader-banner')).toContainText('Bravo');
  await expect(page.locator(`.cell[data-cat="${cat}"][data-val="${val}"]`)).toHaveClass(/used/);

  // Undo puts it all back.
  await page.getByRole('button', { name: '☰ Host' }).click();
  await page.getByRole('button', { name: '↩ Undo' }).click();
  await expect(score(page, 'Bravo')).toHaveText('0');
  await expect(page.locator(`.cell[data-cat="${cat}"][data-val="${val}"]`)).toHaveClass(/clickable/);
});

test('dual screen: a player buzzes, the host phone sees the answer and awards it', async ({ page, browser }) => {
  const code = room();
  await startBoard(page, code);
  await rig(page);

  const host = await (await browser.newContext()).newPage();
  await host.goto(`/?host=${code}`);
  await expect(host.getByText('Waiting for a question on the TV…')).toBeVisible();

  const player = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await player.goto(`/?join=${code}`);
  await player.getByPlaceholder('Your name').fill('Pat');
  await player.getByRole('button', { name: 'Join' }).click();
  await player.getByRole('button', { name: 'Bravo' }).click();
  await player.getByRole('button', { name: 'Continue' }).click();
  await expect(player.getByRole('button', { name: 'BUZZ' })).toBeDisabled();

  const { cell, val } = await firstSquare(page);
  await cell.click();
  await expect(page.getByText('Answer is on the host phone')).toBeVisible();
  await expect(host.locator('.qtext')).toBeVisible();
  await expect(page.locator('#overlay .atext')).toHaveCount(0); // TV still hides it

  await player.getByRole('button', { name: 'BUZZ' }).click();
  await expect(player.getByText("You're up")).toBeVisible();
  await expect(page.locator('.buzz-lead')).toHaveText('Pat · Bravo');
  await expect(host.locator('.buzz-lead')).toHaveText('Pat · Bravo');

  await host.getByRole('button', { name: `Correct (+${val})` }).click();
  await expect(page.locator('#overlay')).toHaveCount(0);
  await expect(score(page, 'Bravo')).toHaveText(String(val));
  await expect(host.getByText('Waiting for a question on the TV…')).toBeVisible();
  await expect(player.getByRole('button', { name: 'BUZZ' })).toBeDisabled();
});

test('Daily Double: wager, reveal, settle', async ({ page }) => {
  await startBoard(page, room());
  const { cat, val } = await firstSquare(page);
  await rig(page, { category: cat, value: val });
  await page.locator(`.cell[data-cat="${cat}"][data-val="${val}"]`).click();
  await expect(page.getByText('🎯 DAILY DOUBLE! 🎯')).toBeVisible();
  await page.getByRole('button', { name: '300', exact: true }).click();
  await page.getByRole('button', { name: 'Lock In Wager' }).click();
  await page.getByRole('button', { name: 'Reveal Answer' }).click();
  await page.getByRole('button', { name: 'Got It Right (+300)' }).click();
  await expect(score(page, 'Alpha')).toHaveText('300');
});

test('The Reckoning: a duel pays the winner and docks the loser half', async ({ page }) => {
  await startBoard(page, room(), 'Round 9: The Reckoning');
  await page.locator('.cell[data-cat="Head to Head"][data-val="200"]').click();
  await page.locator('#overlay .team-btn', { hasText: 'Bravo' }).click();
  await expect(page.locator('#overlay .qtext.task')).toBeVisible();
  await page.locator('#overlay .team-btn', { hasText: 'Alpha' }).click();
  await expect(score(page, 'Alpha')).toHaveText('200');
  await expect(score(page, 'Bravo')).toHaveText('-100');

  await page.locator('.cell[data-cat="Physical Feats"][data-val="100"]').click();
  await expect(page.locator('#overlay .timer-num')).toBeVisible();
  await page.getByRole('button', { name: /beat it \(\+100\)/ }).click();
  await expect(score(page, 'Alpha')).toHaveText('300');
});

test('a closed tab resumes the same game', async ({ page }) => {
  const code = room();
  await startBoard(page, code);
  await rig(page);
  const { cell, cat, val } = await firstSquare(page);
  await cell.click();
  await page.locator('#revealBtn').click();
  await page.locator('#overlay [data-prefix="award"]', { hasText: 'Alpha' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Resume That Game' }).click();
  await expect(score(page, 'Alpha')).toHaveText(String(val));
  await expect(page.locator(`.cell[data-cat="${cat}"][data-val="${val}"]`)).toHaveClass(/used/);
});

test('a game saved by the old single-file version still resumes', async ({ page }) => {
  await page.goto(`/?room=${room()}`);
  await page.evaluate(() => {
    localStorage.setItem('gns.save.v1', JSON.stringify({
      nextTeamId: 3,
      state: {
        teams: [{ id: 1, name: 'Old A', score: 400, color: '#f5c518' }, { id: 2, name: 'Old B', score: 100, color: '#2ecc71' }],
        used: { 'History|100': true }, screen: 'board', roundIndex: 2, readerIndex: 1, spice: 'family', drinks: false,
        boardSize: 4, activeCategories: ['History', 'Cars & Trucks', 'Internet & Memes', 'Classic Rock & 80s'], boardIntro: false,
        dd: { category: 'History', value: 400 }, wild: { 'Cars & Trucks|200': true }, fillers: {}, drawn: { bonus: [0, 1] }, history: [],
      },
    }));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Resume That Game' }).click();
  await expect(page.locator('.board-title')).toContainText('Round 3');
  await expect(score(page, 'Old A')).toHaveText('400');
  await expect(page.locator('.reader-banner')).toContainText('Old B');
});

test('board cleared: Final Showdown through to the winner screen', async ({ page }) => {
  await startBoard(page, room());
  await rig(page);
  const { cat, val } = await firstSquare(page);
  await page.evaluate(([cat, val]) => window.gns.update(d => {
    for (const c of d.activeCategories!) for (const v of [100, 200, 300, 400, 500]) if (c !== cat || v !== val) d.used[c + '|' + v] = true;
    d.teams[0].score = 1000;
  }), [cat, val] as const);
  await page.locator(`.cell[data-cat="${cat}"][data-val="${val}"]`).click();
  await page.locator('#revealBtn').click();
  await page.locator('#overlay #noneBtn').click();
  await page.getByRole('button', { name: 'Final Showdown' }).click();
  await page.getByRole('button', { name: 'EVERYTHING' }).click();
  await page.getByRole('button', { name: 'Lock It In' }).click(); // only Alpha has points
  await page.getByRole('button', { name: 'Reveal the Answer' }).click();
  await page.getByRole('button', { name: 'Wrong ✗' }).click();
  await page.getByRole('button', { name: 'Settle Up' }).click();
  await expect(page.getByText('🎉 Game Over! 🎉')).toBeVisible();
  await expect(page.locator('.winner-name')).toHaveText('Alpha');
  await expect(page.locator('.panel .team-entry').first()).toContainText('2000');
});

test('Lightning Round tallies and pays 100 a question', async ({ page }) => {
  await page.goto(`/?room=${room()}`);
  for (const name of ['Alpha', 'Bravo']) {
    await page.getByPlaceholder('Team or player name').fill(name);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Start Game' }).click();
  await page.getByRole('button', { name: /Lightning Round/ }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('button', { name: '✓ Got It' }).click();
  await page.getByRole('button', { name: '✓ Got It' }).click();
  await expect(page.locator('.lightning-count')).toHaveText('2 correct');
  await page.evaluate(() => window.gns.update(d => { if (d.modeState?.kind === 'lightning') d.modeState.deadline = Date.now(); }));
  await expect(page.getByText('Team 2 of 2')).toBeVisible();
  await expect(score(page, 'Alpha')).toHaveText('200');
});
