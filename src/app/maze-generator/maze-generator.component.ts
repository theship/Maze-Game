import {
  ViewChild, Component, OnInit, Output, EventEmitter, ElementRef, ChangeDetectorRef, HostListener,
  HostBinding,
} from '@angular/core';
import { Cell } from "../classes/cell/cell"
import {MdDialog} from '@angular/material';
import {DialogContentComponent} from "../dialog-content/dialog-content.component"


@Component({
  selector: 'app-maze-generator',
  templateUrl: './maze-generator.component.html',
  styleUrls: ['./maze-generator.component.css'],
})
export class MazeGeneratorComponent implements OnInit {

  @Output() update = new EventEmitter<any>();
  @ViewChild('grid') grid;
  @ViewChild('gridItem') gridItem;
  @ViewChild('avatar') avatar;
  constructor(public dialog: MdDialog, private el: ElementRef, private cdr: ChangeDetectorRef) { }
  rows: number;
  gridLocation: object;
  columns: number;
  dimensions: number;
  startPosition: { x: number, y: number, collectables: number };
  moveFunction: any;
  isNightMode: boolean;
  staticCollectables: number;
  map: Array<Array<[Cell, boolean]>>;
  movesSoFar :{moves:number};
  ngOnInit() {
    this.rows = Math.floor(Math.random() * 7) + 3;
    this.columns = Math.floor(Math.random() * 7) + 3;
    this.movesSoFar = {moves:0};
    // this.rows = 3;
    // this.columns = 3;
    this.startPosition = { y: Math.floor(Math.random() * this.rows), x: Math.floor(Math.random() * this.columns), collectables: 0 };
    this.isNightMode = false;
    this.map = [];
    for (let i = 0; i < this.rows; i++) {
      this.map[i] = [];
      for (let j = 0; j < this.columns; j++) {
        this.map[i][j] = [new Cell(), false];
      }
    }
    this.generateMaze();
    if (this.map[this.startPosition.y][this.startPosition.x][0].hasCollectable) {
      this.map[this.startPosition.y][this.startPosition.x][0].hasCollectable = false;
      this.startPosition.collectables--;
    }

  }



  ngAfterViewInit() {
    let part2 = this.gridItem._element.nativeElement;
    let compuStyle = window.getComputedStyle(part2);
    var stylesObj = { width: compuStyle.width, height: compuStyle.height };
    this.avatar.size = stylesObj;
    this.gridLocation = { left: this.gridItem._element.nativeElement.getBoundingClientRect().left, top: this.gridItem._element.nativeElement.getBoundingClientRect().top };
    let dim = Math.min(Number(compuStyle.width.match(/\d+/g)[0]), Number(compuStyle.height.match(/\d+/g)[0])) / 2;
    this.dimensions = dim;
    this.moveFunction = this.avatar.move;
    this.avatar.movesSoFar = this.movesSoFar;
    setTimeout(()=>{
      this.openDialog()
    },2400 )
      
    this.cdr.detectChanges();

  }

  openDialog(){
    // this.dialog.open(DialogContentComponent, {data: 'ehhhfalse'});
    let dialogRef = this.dialog.open(DialogContentComponent, {data:{gameOver:false}, disableClose:true});
    // let dialogRef = dialog.open(YourDialog, { data: 'your data',});
  }


  gameOver(event){
        let dialogRef = this.dialog.open(DialogContentComponent, {data:{gameOver:true, moves:this.movesSoFar.moves,size:this.rows,collectibles:this.staticCollectables}, disableClose:true});
  }
  
  toggleNightMode(){
    this.isNightMode = !this.isNightMode;
            console.log("WALAHY HEYA EL MOVES FE MAZE: ", this.movesSoFar);

  }

  generateMaze() {
    let unvisitedCells = this.rows * this.columns - 1;
    let cellsStack = [];
    let currentCell = [];
    currentCell.push(Math.floor(Math.random() * this.rows));
    currentCell.push(Math.floor(Math.random() * this.columns));
    this.map[currentCell[0]][currentCell[1]][1] = true;
    if (this.map[currentCell[0]][currentCell[1]][0].hasCollectable)
      this.startPosition.collectables++;
    while (unvisitedCells > 0) {
      let unvisitedNeighbors = this.getUnvisitedNeighbors(currentCell);
      if (unvisitedNeighbors.length > 0) {
        let randomUnvisitedNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
        let choosenNeighbor = randomUnvisitedNeighbor == 0 ? [currentCell[0], currentCell[1] - 1] :
          randomUnvisitedNeighbor == 1 ? [currentCell[0] - 1, currentCell[1]] : randomUnvisitedNeighbor == 2 ?
            [currentCell[0], currentCell[1] + 1] : [currentCell[0] + 1, currentCell[1]];
        cellsStack.push(currentCell);
        this.map[currentCell[0]][currentCell[1]][0].removeWall(randomUnvisitedNeighbor);
        this.map[choosenNeighbor[0]][choosenNeighbor[1]][0].removeWall((randomUnvisitedNeighbor + 2) % 4);
        currentCell = choosenNeighbor
        this.map[currentCell[0]][currentCell[1]][1] = true;
        if (this.map[currentCell[0]][currentCell[1]][0].hasCollectable)
          this.startPosition.collectables++;

        unvisitedCells--;
      }
      else {
        currentCell = cellsStack.pop()
      }
    }
    this.staticCollectables = this.startPosition.collectables;
  }

  swyped(event: any) {
    console.log(event)
    console.log("AYWA BA2A WE YALLA BA2A")
    this.avatar.swyped(event);
  }

  // updateNightMode(event){
  //   console.log("Avatar Night: "+event);
  //   console.log("Maze Night: "+this.isNightMode);
  //   this.isNightMode = !this.isNightMode;
  // }


  getUnvisitedNeighbors(currentCell: Array<number>): Array<number> {
    let neighbors = [];
    if (currentCell[0] > 0 && !this.map[currentCell[0] - 1][currentCell[1]][1])
      neighbors.push(1) //up
    if (currentCell[0] < this.rows - 1 && !this.map[currentCell[0] + 1][currentCell[1]][1])
      neighbors.push(3) //down    
    if (currentCell[1] > 0 && !this.map[currentCell[0]][currentCell[1] - 1][1])
      neighbors.push(0) //left
    if (currentCell[1] < this.columns - 1 && !this.map[currentCell[0]][currentCell[1] + 1][1])
      neighbors.push(2) //right        
    return neighbors;
  }
}
