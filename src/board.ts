import chalk from "chalk";
import { Selection, Position } from "./input";
import stripAnsi from "strip-ansi";

const BOMB = "^";
const BOMB_SEEN = "*";
const NO_BOMBS_AROUND = "-";
const FLAG = "⚑";

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

export class Board {
  private selection: Selection;
  private data: string[][];
  private ended = false;
  private selected = 0;
  private flags: Record<string, boolean> = {};

  constructor(
    private rows: number,
    private cols: number,
    private bombs: number,
    private debug = false
  ) {
    this.selection = new Selection(rows, cols);
    this.selection.on("change", () => {
      this.print();
    });
    this.selection.on("select", (pos) => {
      this.selectCell(pos);
    });
    this.selection.on("toggleFlag", (pos) => {
      this.toggleFlag(pos);
    });

    this.bombs = Math.min(this.bombs, rows * cols);

    this.data = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(" "));

    // I know, not the best approach :P
    const boardChoices = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        boardChoices.push([i, j]);
      }
    }

    for (let i = 0; i < bombs; i++) {
      if (boardChoices.length === 0) {
        break;
      }
      const index = getRandomInt(0, boardChoices.length);
      this.data[boardChoices[index][0]][boardChoices[index][1]] = BOMB;
      [boardChoices[index], boardChoices[boardChoices.length - 1]] = [
        boardChoices[boardChoices.length - 1],
        boardChoices[index],
      ];
      boardChoices.pop();
    }
  }

  start() {
    this.selection.init();
    this.print();
  }

  // FLAG HANDLING

  private getFlagKey(pos: Position) {
    return `${pos.x}-${pos.y}`;
  }

  private parseFlagKey(key: string): Position {
    const [x, y] = key.split("-").map((s) => +s);
    return { x, y };
  }

  private toggleFlag(pos: Position, redraw = true) {
    if (this.hasFlag(pos)) {
      delete this.flags[this.getFlagKey(pos)];
    } else {
      this.flags[this.getFlagKey(pos)] = true;
    }
    if (redraw) this.print();
  }

  private hasFlag(pos: Position): boolean {
    return Boolean(this.flags[this.getFlagKey(pos)]);
  }

  prepareData() {
    const copy = [];
    for (const row of this.data) {
      const rowCopy: string[] = [];
      for (let cell of row) {
        if (cell === BOMB) {
          if (this.ended) {
            cell = chalk.bgRed(BOMB_SEEN);
          } else {
            cell = this.debug ? BOMB : " ";
          }
        } else if (cell === NO_BOMBS_AROUND) {
          cell = chalk.bgGreen(" ");
        } else if (cell === BOMB_SEEN) {
          cell = chalk.bgRed(BOMB_SEEN);
        }
        rowCopy.push(cell);
      }
      copy.push(rowCopy);
    }
    if (!this.ended)
      for (const key of Object.keys(this.flags)) {
        const { x, y } = this.parseFlagKey(key);
        copy[y][x] = FLAG;
      }

    const pos = this.selection.position;
    if (!this.ended)
      copy[pos.y][pos.x] = chalk.bgRed(stripAnsi(copy[pos.y][pos.x]));
    return copy;
  }

  constructTable() {
    const data = this.prepareData();
    const cols = data[0] ? data[0].length : 1;
    let table: string = "┏" + Array(cols).fill("━").join("┳") + "┓";
    for (let i = 0; i < data.length; i++) {
      table += "\n";
      table += "┃" + data[i].join("┃") + "┃";
      if (i != data.length - 1) {
        table += "\n";
        table += "┣" + Array(cols).fill("━").join("╋") + "┫";
      }
    }
    table += "\n";
    table += "┗" + Array(cols).fill("━").join("┻") + "┛";
    return table;
  }

  print() {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
    const table = this.constructTable();
    process.stdout.write(table);
  }

  selectCell(pos: Position, redraw = true) {
    const { x: col, y: row } = pos;

    // block select on flags
    if (redraw && this.hasFlag(pos)) {
      return;
    }

    // if redraw is false, it means
    // we're recursively selecting neighboring
    // cells around a cell with no bombs around
    // in such a case, we're removing the flag
    if (!redraw && this.hasFlag(pos)) {
      this.toggleFlag(pos, false);
    }

    // too bad :(
    if (this.data[row][col] === BOMB) {
      this.data[row][col] = BOMB_SEEN;
      return this.endGame();
    }

    // already selected
    if (this.data[row][col] !== " ") {
      return;
    }

    this.selected++;
    const around = this.getBombsAround(pos);

    // when no bomb around, recursively reveal fields around
    if (around === 0) {
      this.data[row][col] = NO_BOMBS_AROUND;
      for (const n of this.getNeighborCells(pos)) this.selectCell(n, false);
    } else {
      this.data[row][col] = String(around);
    }

    if (!redraw) return;
    this.checkEndGame();
    this.print();
  }

  checkEndGame() {
    if (this.rows * this.cols == this.bombs + this.selected) this.endGame();
  }

  endGame() {
    this.ended = true;
    this.print();
    process.exit();
  }

  getBombsAround(pos: Position) {
    const { x: col, y: row } = pos;

    if (this.data[row][col] === BOMB) {
      return -1;
    }

    let neighborBombs = 0;
    const neighbors = this.getNeighborCells(pos);

    for (const { x, y } of neighbors) {
      if (this.data[y][x] === BOMB) neighborBombs++;
    }

    return neighborBombs;
  }

  getNeighborCells(pos: Position) {
    const { x: col, y: row } = pos;
    const neighbors: Position[] = [];
    for (const [r, c] of [
      [row, col + 1],
      [row, col - 1],
      [row + 1, col],
      [row - 1, col],
      [row - 1, col - 1],
      [row + 1, col + 1],
      [row + 1, col - 1],
      [row - 1, col + 1],
    ]) {
      if (r < 0 || r >= this.rows) continue;
      if (c < 0 || c >= this.cols) continue;
      neighbors.push({ x: c, y: r });
    }
    return neighbors;
  }
}
