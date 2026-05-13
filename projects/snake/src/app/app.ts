import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HostListener } from '@angular/core';
// import { Component, OnInit, HostListenerIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  gridSize = 20;

  mode: 'none' | 'single' | 'multi' = 'none';

  // Snake1
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  // Snake2
  snake2 = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ];

  direction2 = { x: 1, y: 0 };
  nextDirection2 = { x: 1, y: 0 };

  // ✅ FAST LOOKUP MAPS (fix UI lag)
  snakeMap = new Set<string>();
  snake2Map = new Set<string>();

  food = { x: 5, y: 10 };

  score1 = 0;
  score2 = 0;

  snake1Alive = true;
  snake2Alive = true;

  targetScore: number | null = null;

  gameOver = false;
  winner: string | null = null;

  isPaused = false;

  intervalId: any;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.generateFood();
  }

  selectMode(m: 'single' | 'multi') {
    this.mode = m;
    this.restart();
  }

  startGame() {
    clearInterval(this.intervalId);

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.moveSnake();
      }, 200);
    });
  }

  moveSnake() {
    if (this.gameOver || this.isPaused) return;

    this.direction = this.nextDirection;

    // ===== Snake 1 =====
    const newSnake = [...this.snake];
    const head = { ...newSnake[0] };

    head.x = (head.x + this.direction.x + this.gridSize) % this.gridSize;
    head.y = (head.y + this.direction.y + this.gridSize) % this.gridSize;

    if (newSnake.some(s => s.x === head.x && s.y === head.y)) {
      this.snake1Alive = false;
    }

    if (this.snake1Alive) {
      newSnake.unshift(head);

      if (head.x === this.food.x && head.y === this.food.y) {
        this.score1++;
        this.generateFood();
      } else {
        newSnake.pop();
      }

      this.snake = newSnake;
    }

    // ===== Snake 2 (only in multiplayer) =====
    if (this.mode === 'multi' && this.snake2Alive) {

      this.direction2 = this.nextDirection2;

      const newSnake2 = [...this.snake2];
      const head2 = { ...newSnake2[0] };

      head2.x = (head2.x + this.direction2.x + this.gridSize) % this.gridSize;
      head2.y = (head2.y + this.direction2.y + this.gridSize) % this.gridSize;

      if (newSnake2.some(s => s.x === head2.x && s.y === head2.y)) {
        this.snake2Alive = false;
      }

      newSnake2.unshift(head2);

      if (head2.x === this.food.x && head2.y === this.food.y) {
        this.score2++;
        this.generateFood();
      } else {
        newSnake2.pop();
      }

      this.snake2 = newSnake2;
    }

    // ✅ Update FAST lookup maps
    this.snakeMap.clear();
    for (const s of this.snake) {
      this.snakeMap.add(`${s.x}-${s.y}`);
    }

    this.snake2Map.clear();
    if (this.mode === 'multi') {
      for (const s of this.snake2) {
        this.snake2Map.add(`${s.x}-${s.y}`);
      }
    }

    this.checkWinner();

    this.cdr.detectChanges();
  }

  // ✅ YOUR CUSTOM WIN LOGIC
  checkWinner() {

    // Single mode
    if (this.mode === 'single') {
      if (!this.snake1Alive) {
        this.winner = 'Game Over 💀';
        this.endGame();
      }
      return;
    }

    // Multiplayer logic
    if (!this.snake1Alive && this.snake2Alive && this.targetScore === null) {
      this.targetScore = this.score1;
      return;
    }

    if (!this.snake2Alive && this.snake1Alive && this.targetScore === null) {
      this.targetScore = this.score2;
      return;
    }

    if (this.targetScore !== null) {

      if (this.snake1Alive && !this.snake2Alive) {
        if (this.score1 > this.targetScore) {
          this.winner = 'Green Wins 🎉';
          this.endGame();
        }
      }

      if (this.snake2Alive && !this.snake1Alive) {
        if (this.score2 > this.targetScore) {
          this.winner = 'Blue Wins 🎉';
          this.endGame();
        }
      }

      if (!this.snake1Alive && !this.snake2Alive) {
        if (this.score1 > this.score2) {
          this.winner = 'Green Wins 🎉';
        } else if (this.score2 > this.score1) {
          this.winner = 'Blue Wins 🎉';
        } else {
          this.winner = 'Draw 🤝';
        }
        this.endGame();
      }
    }
  }

  endGame() {
    this.gameOver = true;
    clearInterval(this.intervalId);
  }

  restart() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    this.snake2 = this.mode === 'multi'
      ? [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 }
        ]
      : [];

    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    this.direction2 = { x: 1, y: 0 };
    this.nextDirection2 = { x: 1, y: 0 };

    this.score1 = 0;
    this.score2 = 0;

    this.snake1Alive = true;
    this.snake2Alive = this.mode === 'multi';

    this.targetScore = null;

    this.winner = null;
    this.gameOver = false;
    this.isPaused = false;

    this.generateFood();

    this.snakeMap = new Set(this.snake.map(s => `${s.x}-${s.y}`));
    this.snake2Map = new Set(this.snake2.map(s => `${s.x}-${s.y}`));

    this.startGame();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    switch (event.key) {
      case 'ArrowUp': if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 }; break;
      case 'ArrowDown': if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 }; break;
      case 'ArrowLeft': if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 }; break;
      case 'ArrowRight': if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 }; break;
    }

    if (this.mode === 'multi') {
      switch (key) {
        case 'w': if (this.direction2.y !== 1) this.nextDirection2 = { x: 0, y: -1 }; break;
        case 's': if (this.direction2.y !== -1) this.nextDirection2 = { x: 0, y: 1 }; break;
        case 'a': if (this.direction2.x !== 1) this.nextDirection2 = { x: -1, y: 0 }; break;
        case 'd': if (this.direction2.x !== -1) this.nextDirection2 = { x: 1, y: 0 }; break;
      }
    }
  }

  isSnake(x: number, y: number) {
    return this.snakeMap.has(`${x}-${y}`);
  }

  isSnake2(x: number, y: number) {
    return this.snake2Map.has(`${x}-${y}`);
  }

  isHead(x: number, y: number) {
    return this.snake[0]?.x === x && this.snake[0]?.y === y;
  }

  isHead2(x: number, y: number) {
    return this.snake2[0]?.x === x && this.snake2[0]?.y === y;
  }

  getGrid() {
    return Array(this.gridSize);
  }

  generateFood() {
    this.food = {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize)
    };
  }
}