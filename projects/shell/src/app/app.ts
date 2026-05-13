import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { GameCard} from 'shared-ui';
// import { NgClass } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    GameCard,
    // NgClass,
    // RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('shell');
  openGame(game: string) {
  switch (game) {
    case 'tic-tac-toe':
      window.location.href = 'http://localhost:4300';
      break;
    case 'snake':
      window.location.href = 'http://localhost:4400';
      break;
      case 'sudoku':
        window.location.href = 'http://localhost:4500';
        break;
  }
}
}
