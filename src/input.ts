import readline from "readline";
import Emittery from "emittery";

export interface Position {
  x: number;
  y: number;
}

export class Selection extends Emittery<{
  change: Position;
  select: Position;
  toggleFlag: Position;
}> {
  private x = 0;
  private y = 0;

  constructor(private rows: number, private cols: number) {
    super();
  }

  init() {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    
    process.stdin.on(
      "keypress",
      (str: string | undefined, key: readline.Key) => {
        switch (key.name) {
          case "right":
            this.moveRight(key.shift ? 5 : 1);
            break;

          case "left":
            this.moveLeft(key.shift ? 5 : 1);
            break;

          case "up":
            this.moveUp(key.shift ? 5 : 1);
            break;

          case "down":
            this.moveDown(key.shift ? 5 : 1);
            break;

          case "space":
            this.emit("select", this.position);
            break;

          case "f":
            this.emit("toggleFlag", this.position);
            break;

          case "c":
            if (key.ctrl) process.exit();
            break;

          case "q":
            process.exit();

          default:
            break;
        }
      }
    );
  }

  get position(): Position {
    return {
      x: this.x,
      y: this.y,
    };
  }

  moveLeft(by = 1) {
    const newX = Math.max(0, this.x - by);
    if (newX === this.x) return;
    this.x = newX;
    this.emit("change", this.position);
  }

  moveRight(by = 1) {
    const newX = Math.min(this.cols - 1, this.x + by);
    if (newX === this.x) return;
    this.x = Math.min(this.cols - 1, this.x + by);
    this.emit("change", this.position);
  }

  moveUp(by = 1) {
    const newY = Math.max(0, this.y - by);
    if (newY === this.y) return;
    this.y = newY;
    this.emit("change", this.position);
  }

  moveDown(by = 1) {
    const newY = Math.min(this.rows - 1, this.y + by);
    if (newY === this.y) return;
    this.y = newY;
    this.emit("change", this.position);
  }
}
