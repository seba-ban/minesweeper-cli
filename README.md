# Minesweeper

Just for fun. Code not the best...

## Controls

`q` or `ctrl+c` to quit.

`space` to select a cell.

`f` to toggle a flag.

## Usage

Build using `npm run build`. After that, `npm start`.

```bash
$ npm start -- --help

> minesweeper-cli@1.0.0 start
> node .

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -r, --rows     number of rows for the board              [number] [default: 5]
  -c, --cols     number of cols for the board             [number] [default: 10]
  -b, --bombs    number of bombs to place on the board     [number] [default: 5]
      --debug    show placement of the bombs          [boolean] [default: false]
```