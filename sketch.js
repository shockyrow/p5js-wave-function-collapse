const SKETCH_PADDING = 16;
const SKETCH_BACKGROUND_COLOR = 24;

const CELL_SIZE = 32;
const CELL_MARGIN = CELL_SIZE / 4;
const CELL_BORDER_RADIUS = CELL_SIZE / 16;
const CELL_PIPE_WIDTH = CELL_SIZE / 4;
const CELL_PIPE_COLOR = 128;
const CELL_BORDER_COLOR = 48;
const CELL_BACKGROUND_COLOR = 32;
const CELL_HIGHLIGHT_BACKGROUND_COLOR = 64;

const CELL_TYPE_NONE = -1;
const CELL_TYPE_EMPTY = 0;
const CELL_TYPE_NORTH = 1;
const CELL_TYPE_EAST = 2;
const CELL_TYPE_SOUTH = 3;
const CELL_TYPE_WEST = 4;

const cols = 32;
const rows = 16;

let autorun = false;
let cells = [];
let available_cells = [];
let hovered_cell = null;

function createCell(index) {
  return {
    id: index,
    options: [
      CELL_TYPE_EMPTY,
      CELL_TYPE_NORTH,
      CELL_TYPE_EAST,
      CELL_TYPE_SOUTH,
      CELL_TYPE_WEST,
    ],
  };
}

function resetCells() {
  autorun = false;
  cells = [];

  for (let i = 0; i < rows * cols; i++) {
    cells.push(createCell(i));
  }

  available_cells = cells;
}

resetCells();

function setup() {
  let calculated_width =
    SKETCH_PADDING * 2 + cols * (CELL_SIZE + CELL_MARGIN) - CELL_MARGIN;
  let calculated_height =
    SKETCH_PADDING * 2 + rows * (CELL_SIZE + CELL_MARGIN) - CELL_MARGIN;

  createCanvas(calculated_width, calculated_height);
  // frameRate(1);
}

function draw() {
  background(SKETCH_BACKGROUND_COLOR);

  hovered_cell = null;
  cells.forEach(drawCell);

  if (autorun) {
    updateByMe();
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    if (keyIsPressed) {
      let random_cell_id = Math.floor(Math.random() * available_cells.length);

      if (keyCode === CONTROL) {
        changeCell(hovered_cell ?? random_cell_id);
      } else if (keyCode === SHIFT) {
        changeCell(hovered_cell ?? random_cell_id, [CELL_TYPE_EMPTY])
      }
    } else {
      autorun = !autorun;
    }
  }
}

function updateByMe() {
  available_cells = available_cells
    .filter((cell) => cell.options.length > 1)
    .sort((cell1, cell2) => cell1.options.length - cell2.options.length);

  if (available_cells.length === 0) {
    return;
  }

  let cells_to_choose_from = available_cells
    .filter((cell) => cell.options.length === available_cells[0].options.length)
    .sort(() => 0.5 - Math.random());

  const cell_id = cells_to_choose_from[0].id;

  changeCell(cell_id);
}

function changeCell(index, options = null) {
  if (cells[index].options.length < 2) {
    return;
  }

  if (options !== null) {
    cells[index].options = options;
  } else {
    cells[index].options = cells[index].options
      .sort(() => 0.5 - Math.random())
      .slice(0, 1);
  }

  calcEntropy(index);
}

function indexToPoint(index) {
  return {
    x: index % cols,
    y: Math.floor(index / cols),
  };
}

function pointToIndex(x, y) {
  if (y < 0 || y >= rows || x < 0 || x >= cols) {
    return -1;
  }

  return y * cols + x;
}

function calcEntropy(index) {
  const dummy_cell = createCell(-1);
  const { x, y } = indexToPoint(index);

  let north_cell = cells[pointToIndex(x, y - 1)] ?? dummy_cell;

  if (north_cell.options.length === 1) {
    north_cell = dummy_cell;
  }

  let east_cell = cells[pointToIndex(x + 1, y)] ?? dummy_cell;

  if (east_cell.options.length === 1) {
    east_cell = dummy_cell;
  }

  let south_cell = cells[pointToIndex(x, y + 1)] ?? dummy_cell;

  if (south_cell.options.length === 1) {
    south_cell = dummy_cell;
  }

  let west_cell = cells[pointToIndex(x - 1, y)] ?? dummy_cell;

  if (west_cell.options.length === 1) {
    west_cell = dummy_cell;
  }

  const type = cells[index].options[0];

  switch (type) {
    case CELL_TYPE_EMPTY:
      north_cell.options = north_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_NORTH].includes(option)
      );
      east_cell.options = east_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_EAST].includes(option)
      );
      south_cell.options = south_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_SOUTH].includes(option)
      );
      west_cell.options = west_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_WEST].includes(option)
      );

      break;
    case CELL_TYPE_NORTH:
      north_cell.options = north_cell.options.filter((option) =>
        [CELL_TYPE_EAST, CELL_TYPE_SOUTH, CELL_TYPE_WEST].includes(option)
      );
      east_cell.options = east_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_SOUTH, CELL_TYPE_WEST].includes(option)
      );
      south_cell.options = south_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_SOUTH].includes(option)
      );
      west_cell.options = west_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_EAST, CELL_TYPE_SOUTH].includes(option)
      );

      break;
    case CELL_TYPE_EAST:
      north_cell.options = north_cell.options.filter((option) =>
        [CELL_TYPE_EAST, CELL_TYPE_SOUTH, CELL_TYPE_WEST].includes(option)
      );
      east_cell.options = east_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_SOUTH, CELL_TYPE_WEST].includes(option)
      );
      south_cell.options = south_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_EAST, CELL_TYPE_WEST].includes(option)
      );
      west_cell.options = west_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_WEST].includes(option)
      );

      break;
    case CELL_TYPE_SOUTH:
      north_cell.options = north_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_NORTH].includes(option)
      );
      east_cell.options = east_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_SOUTH, CELL_TYPE_WEST].includes(option)
      );
      south_cell.options = south_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_EAST, CELL_TYPE_WEST].includes(option)
      );
      west_cell.options = west_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_EAST, CELL_TYPE_SOUTH].includes(option)
      );

      break;
    case CELL_TYPE_WEST:
      north_cell.options = north_cell.options.filter((option) =>
        [CELL_TYPE_EAST, CELL_TYPE_SOUTH, CELL_TYPE_WEST].includes(option)
      );
      east_cell.options = east_cell.options.filter((option) =>
        [CELL_TYPE_EMPTY, CELL_TYPE_EAST].includes(option)
      );
      south_cell.options = south_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_EAST, CELL_TYPE_WEST].includes(option)
      );
      west_cell.options = west_cell.options.filter((option) =>
        [CELL_TYPE_NORTH, CELL_TYPE_EAST, CELL_TYPE_SOUTH].includes(option)
      );

      break;
  }

  [north_cell, east_cell, south_cell, west_cell].forEach((cell) => {
    if (cell.options.length === 1 && cell.id !== -1) {
      calcEntropy(cell.id);
    }
  });
}

function drawCell(cell, index) {
  push();

  let x = (index % cols) * (CELL_SIZE + CELL_MARGIN) + SKETCH_PADDING;
  let y = Math.floor(index / cols) * (CELL_SIZE + CELL_MARGIN) + SKETCH_PADDING;

  let center_x = x + CELL_SIZE / 2;
  let center_y = y + CELL_SIZE / 2;

  stroke(CELL_BORDER_COLOR);

  if (
    mouseX >= x &&
    mouseX < x + CELL_SIZE &&
    mouseY >= y &&
    mouseY < y + CELL_SIZE
  ) {
    fill(CELL_HIGHLIGHT_BACKGROUND_COLOR);
    hovered_cell = cell.id;
  } else {
    fill(CELL_BACKGROUND_COLOR);
  }

  rect(x, y, CELL_SIZE, CELL_SIZE, CELL_BORDER_RADIUS);

  // fill('rgba(255, 215, 0, 0.25)');
  // textSize(10);
  // text(cell.options.length, x, center_y);

  if (cell === null) {
    return;
  }

  strokeWeight(CELL_PIPE_WIDTH);
  strokeCap(SQUARE);
  stroke(CELL_PIPE_COLOR);

  let type = cell.options.length > 1 ? CELL_TYPE_NONE : cell.options[0];

  switch (type) {
    // case CELL_TYPE_EMPTY:
    //   point(center_x, center_y);
    //   break;
    case CELL_TYPE_NORTH:
      line(center_x, center_y, center_x, y);
      line(x, center_y, x + CELL_SIZE, center_y);
      break;
    case CELL_TYPE_EAST:
      line(center_x, center_y, x + CELL_SIZE, center_y);
      line(center_x, y, center_x, y + CELL_SIZE);
      break;
    case CELL_TYPE_SOUTH:
      line(center_x, center_y, center_x, y + CELL_SIZE);
      line(x, center_y, x + CELL_SIZE, center_y);
      break;
    case CELL_TYPE_WEST:
      line(center_x, center_y, x, center_y);
      line(center_x, y, center_x, y + CELL_SIZE);
      break;
    default:
      break;
  }

  pop();
}
