import { Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
winningLines = [
  [0, 1, 2],  
  [3, 4, 5],  
  [6, 7, 8],  
  [0, 3, 6],  
  [1, 4, 7],  
  [2, 5, 8],  
  [0, 4, 8],  
  [2, 4, 6]
];
mode = signal<'none' | 'friend' | 'ai'>('none');
winningCells = signal<number[]>([]);
// aiEnabled = true;
winner = signal<string | null>(null);
isDraw = signal(false);
gameOver = signal(false);


get aiEnabled() {
  return this.mode() === 'ai';
}

selectMode(selected: 'friend' | 'ai') {
  this.mode.set(selected);
  this.reset();
}


checkWinner() {
  const b = this.board();

  
for (const [a, bIndex, c] of this.winningLines) {
  if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
    this.winner.set(b[a]);
    this.gameOver.set(true);
    this.winningCells.set([a, bIndex, c]);  // store winning cells
    return;
  }
}

  // Check draw
  if (b.every(cell => cell)) {
    this.isDraw.set(true);
    this.gameOver.set(true);
  }
}
  board = signal(Array(9).fill(null)); // 3x3 board
  currentPlayer = signal<'X' | 'O'>('X');

 handleClick(index: number) {
  if (this.board()[index] || this.gameOver()) return;

  const newBoard = [...this.board()];

  if (this.mode() === 'friend') {
    newBoard[index] = this.currentPlayer();
    this.board.set(newBoard);
    this.checkWinner();

    if (!this.gameOver()) {
      this.currentPlayer.update(p => (p === 'X' ? 'O' : 'X'));
    }
  }

  if (this.mode() === 'ai') {
    newBoard[index] = 'X'; // player
    this.board.set(newBoard);
    this.checkWinner();

    if (!this.gameOver()) {
      setTimeout(() => this.makeAIMove(), 400);
    }
  }
}
makeAIMove() {
  const board = [...this.board()];

  // 1. Try to win
  let move = this.findBestMove(board, 'O');

  // 2. Block player
  if (move === -1) {
    move = this.findBestMove(board, 'X');
  }

  // 3. Otherwise first empty cell
  if (move === -1) {
    move = board.findIndex(cell => !cell);
  }

  if (move !== -1) {
    board[move] = 'O';
    this.board.set(board);
    this.checkWinner();
  }
}

findBestMove(board: any[], player: 'X' | 'O'): number {
  for (const [a, b, c] of this.winningLines) {
    const line = [board[a], board[b], board[c]];

    // check if 2 same + 1 empty
    if (line.filter(v => v === player).length === 2 &&
        line.filter(v => !v).length === 1) {

      if (!board[a]) return a;
      if (!board[b]) return b;
      if (!board[c]) return c;
    }
  }

  return -1;
}

reset() {
  this.board.set(Array(9).fill(null));
  this.winner.set(null);
  this.isDraw.set(false);
  this.gameOver.set(false);
  this.currentPlayer.set('X');
  this.winningCells.set([]);
}

}