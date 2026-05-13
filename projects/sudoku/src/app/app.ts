import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

  // ✅ GAME STATE
  mode: 'none' | 'easy' | 'medium' | 'hard' = 'none';

  grid: number[][] = [];
  originalGrid: number[][] = [];

  lives = 0;
  maxLives = 0;

  gameOver = false;
  gameWon = false;

  selectedRow: number | null = null;
  selectedCol: number | null = null;
  selectedValue: number | null = null;

  // ✅ TIMER
  time = 0;
  timerId: any;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  // ✅ MODE SELECT
  selectMode(m: 'easy' | 'medium' | 'hard') {
    this.mode = m;

    if (m === 'easy') this.maxLives = 0;
    else if (m === 'medium') this.maxLives = 3;
    else this.maxLives = 5;

    this.lives = this.maxLives;

    this.startGame();
  }

  // ✅ START GAME
  startGame() {

    this.gameOver = false;
    this.gameWon = false;

    const solution = this.generateSolution();

    this.originalGrid = solution.map(r => [...r]);
    this.grid = solution.map(r => [...r]);
    this.removeCells();

    this.time = 0;
    this.startTimer();
  }

  // ✅ TIMER
startTimer() {
  if (this.timerId) {
    clearInterval(this.timerId);
  }

  this.timerId = setInterval(() => {
    this.time++;
    this.cdr.markForCheck(); // ✅ correct with OnPush
  }, 1000);
}
  // ✅ INPUT HANDLER (ONLY ONE VERSION)
  onInput(event: any, row: number, col: number) {

    if (this.originalGrid[row][col] !== 0 || this.gameOver) return;

    const value = event.target.value;

    if (value === '') {
      this.grid[row][col] = 0;
      return;
    }

    const num = Number(value);

    if (!num || num < 1 || num > 9) {
      event.target.value = '';
      this.grid[row][col] = 0;
      return;
    }

    this.grid[row][col] = num;

    // ✅ Check invalid
    if (this.isInvalid(row, col) && this.maxLives > 0) {
      this.lives--;

      if (this.lives <= 0) {
        this.endGame(false);
        return;
      }
    }

    // ✅ Check win
    if (this.checkWin()) {
      this.endGame(true);
    }
  }

  // ✅ END GAME (centralized)
  endGame(isWin: boolean) {
    this.gameWon = isWin;
    this.gameOver = true;

    if (this.timerId) clearInterval(this.timerId);
  }

  // ✅ RESTART TO MODE SCREEN
  restart() {
    this.mode = 'none';

    this.time = 0;
    this.gameOver = false;
    this.gameWon = false;

    this.selectedRow = null;
    this.selectedCol = null;

    if (this.timerId) clearInterval(this.timerId);
  }

  // ✅ CELL SELECT
  selectCell(row: number, col: number) {
    this.selectedRow = row;
    this.selectedCol = col;
    this.selectedValue = this.grid[row][col] || null;
  }

  // ✅ VALIDATION
  isInvalid(row: number, col: number): boolean {
    const val = this.grid[row][col];
    if (!val) return false;

    for (let i = 0; i < 9; i++) {
      if (i !== col && this.grid[row][i] === val) return true;
      if (i !== row && this.grid[i][col] === val) return true;
    }

    const rs = Math.floor(row / 3) * 3;
    const cs = Math.floor(col / 3) * 3;

    for (let i = rs; i < rs + 3; i++) {
      for (let j = cs; j < cs + 3; j++) {
        if ((i !== row || j !== col) && this.grid[i][j] === val) return true;
      }
    }

    return false;
  }

  // ✅ WIN CHECK
  checkWin(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.grid[r][c] === 0 || this.isInvalid(r, c)) return false;
      }
    }
    return true;
  }

  // ✅ TIMER FORMAT
  get formattedTime() {
    const mins = Math.floor(this.time / 60);
    const secs = this.time % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // ✅ SUDOKU GENERATOR
  generateSolution(): number[][] {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solve(grid);
    console.log('Generated Solution:', grid);
    return grid;
  }

  solve(grid: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {

        if (grid[r][c] === 0) {
          const nums = this.shuffle([1,2,3,4,5,6,7,8,9]);

          for (const num of nums) {
            if (this.isSafe(grid, r, c, num)) {
              grid[r][c] = num;

              if (this.solve(grid)) return true;

              grid[r][c] = 0;
            }
          }

          return false;
        }
      }
    }
    return true;
  }

  isSafe(grid: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }

    const rs = Math.floor(row / 3) * 3;
    const cs = Math.floor(col / 3) * 3;

    for (let i = rs; i < rs + 3; i++) {
      for (let j = cs; j < cs + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }

    return true;
  }

  shuffle(arr: number[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  removeCells() {
    let count = this.mode === 'easy' ? 30 :
                this.mode === 'medium' ? 45 : 55;

    while (count > 0) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);

      if (this.grid[r][c] !== 0) {
        this.grid[r][c] = 0;
        this.originalGrid[r][c] = 0;
        count--;
      }
    }
  }

  restrictInput(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'Tab'];
    if (!allowed.includes(event.key) && !/^[1-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  trackRow(i: number) { return i; }
  trackCol(i: number) { return i; }
}