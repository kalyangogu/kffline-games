import { Component,Input } from '@angular/core';
import { NgClass } from '@angular/common';
@Component({
  selector: 'kff-game-card',
  imports: [NgClass],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css',
})
export class GameCard {
  
 @Input() title = '';
  @Input() color: 'red' | 'green' | 'blue' | 'yellow' = 'blue';
@Input() icon = '';
}
