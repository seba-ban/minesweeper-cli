import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Board } from "./board";

const main = async () => {
  const opts = await yargs(hideBin(process.argv))
    .option("rows", {
      alias: "r",
      describe: "number of rows for the board",
      number: true,
      default: 5,
    })
    .option("cols", {
      alias: "c",
      describe: "number of cols for the board",
      number: true,
      default: 10,
    })
    .option("bombs", {
      alias: "b",
      describe: "number of bombs to place on the board",
      number: true,
      default: 5,
    })
    .option("debug", {
      describe: "show placement of the bombs",
      boolean: true,
      default: false,
    }).argv;

  const board = new Board(opts.rows, opts.cols, opts.bombs, opts.debug);
  board.start();
};

main();
