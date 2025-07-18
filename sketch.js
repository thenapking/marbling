let DPI = 96;
let wi = 5;
let hi = 7;
let bwhi = 1.5;
let bwwi = 2;
let mwi = 1/3;

const W = wi * DPI;
const H = hi * DPI;
const BWW = bwwi * DPI;
const BWH = bwhi * DPI;
const MW = mwi * DPI;
const FW = W + 2 * BWW;
const FH = H + 2 * BWH;

let palettes = {
  "mindful171":  ['#FDFBF8', '#FFD662', '#E84998', '#0044AA', '#00177D', '#1E80C7'],
  "marble": ['#e0d2bb', '#26231e', '#883c29', '#edb137', '#3067aa', '#9db2b0', '#e0d2bb'],
  "marble2": ['#dcd3c1', '#0f0608', '#6c0414', '#d19b8e', '#d48c31', '#3b5266', '#546a79', '#dcd3c1'],
  "marble3": ['#f3f4f3', "#085dc1", "#bd0053", "#e89761", "#004963", "#0945c8", '#f3f4f3'],
  "marble4": ['#eeefef', '#584478', '#584771', '#5e6f9c', '#275fa0', '#1b4c90', '#1d5295', '#395282', '#0e2d65'],
  "mindful167": ['#F9F7F6', '#DFD3CA', '#726259', '#F7B732', '#840804', '#16110D', '#F9F7F6'],
};

let palette_names = Object.keys(palettes);
let palette_name = "marble";
let palette = palettes[palette_name];
let bg = palette[0];

let debug = true;

let drops = [];
let t =0 ;
let paused  = false;
let exporting = true;
let final_render = false;

let current_colour = 2;
let current_size = 25;

let granularity = 5;

let seed;
let next_postions = [];

let u = 0.5

let gridCols = wi/u;
let gridRows = hi/u;
let grid = [];
let cells = [];

function setup() {
  createCanvas(FW, FH);

  seed = Math.floor(random(1000000));
  randomSeed(seed);
  noiseSeed(seed);
  console.log("Seed: ", seed);

  frameRate(30);
  pixelDensity(1);

  p5grain.setup();
  create_layout();

}

let drop_interval = 20;
function draw() {
  let file_name;
  if(exporting && final_render ){ 
    file_name = `spokes_${seed}.svg`;
    console.log("Exporting to: ", file_name);
    beginRecordSVG(this, file_name); 
  }

  background(bg);

  if(t%drop_interval == 0){ 
    drop_interval = Math.floor(random(15*u, 20*u))
    add_drops_to_grid()
  }

  update_groups();

  draw_alignment_guide(); 

  push();
    translate(BWW, BWH);

    push();
      scale(u)
      draw_grid();
      draw_drops();
    pop();
    push()
      draw_borders();
    pop();
  pop();
  

  
  if(exporting && file_name){ endRecordSVG(this); paused = true; exporting = false; }

  if(paused){
    noLoop();
  } else {
    t++;  
  }
}







function draw_borders(){
  noFill();
  strokeWeight(2);
  stroke(palette[1]);
  rect(-BWW/3, -BWW/3, W+2*BWW/3, H+2*BWW/3);
}


function draw_drops(){
  for(let drop of drops){
    drop.draw_spokes(4)
  }
}

function update_groups(){
  let active = false;
  for(let drop of drops){
    drop.update();
    if(drop.active) { active = true; }
  }

  if(!active && cells.length == drops.length){ 
    console.log("All drops have finished");
    final_render = true; 
  }
}

function add_drops(){
  let counter = drops.length;
  let n = Math.floor((150 - current_size) / 25);
  let m = n + 1;
  if(counter >= n*m) { return; } // Limit the number of drops

  if(n < 1) { return }
  let step = W / n;
  let i = counter % n;
  let j = Math.floor(counter / n) % m;
  
  let rnd = 10
  let x = i * step + step / 2 + random(-rnd, rnd);
  let y = j * step + step     + random(-rnd, rnd);
  add_drop(x, y, current_size);
}

function add_drops_to_grid(){
  let counter = drops.length;
  if(counter > cells.length - 1) { return; } // Limit the number of drops
  let cell = cells[counter];
  let size = cell.size;

  let rnd = 10
  let x = cell.x + 0.5 * size;
  let y = cell.y + 0.5 * size;
  let sf = 100;
  x *= sf;
  y *= sf;
  x+= random(-rnd, rnd);
  y+= random(-rnd, rnd);

  // let sz_map = [0, 0.4, 0.37, 0.35, 0.33, 0.33]
  // let fsz = sz_map[size] * size;
  let fsz = size * 0.3 * sf;
  add_drop(x, y, fsz);
}

function mousePressed(){
  let x = mouseX - BWW;
  let y = mouseY - BWH;
  current_size-= 0.2

  // add_drop(x, y, current_size);

}

function add_drop(x, y, r){
  // if(r < 5) { return }
  // if(x < r || x > W - r || y < r || y > H - r){ return }
  if(!r) { return}

  let drop = new Group(x, y, r, current_colour);
  
  marble(drop);
  drops.push(drop);
}

function marble(drop){
  for(let other of drops){
    other.marble(drop.position, drop.radius);
  }
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('marbling', 'png');
  }

  if(key === 'c') {
    current_colour++;
    current_colour = current_colour % palette.length;
  }

  if(key === ' ') {
    paused = !paused;
    if(!paused){
      loop();
    }
  }

  if(key === 'd'){
    debug = !debug;
  }
}

function create_layout(){
  for (let y = 0; y < gridRows; y++) {
    grid[y] = [];
    for (let x = 0; x < gridCols; x++) {
      grid[y][x] = false;
    }
  }

  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      cells.push({ x, y });
    }
  }

  cells = shuffle(cells);

  // Try placing squares at each cell
  for (let cell of cells) {
    let x = cell.x;
    let y = cell.y;

    if (!grid[y][x]) {
      let maxSize = getMaxSquareSize(x, y);
      let size = chooseSize(maxSize);
      markFilled(x, y, size);
      cell.size = size;
    }
  }

  // Remove empty cells
  cells = cells.filter(cell => cell.size > 0);
  // cells = cells.sort((a, b) => {
  //   if (a.y !== b.y) {
  //     return a.y - b.y; // primary sort on y
  //   } else {
  //     return a.x - b.x; // secondary sort on x
  //   }
  // });

  let cx = cells.reduce((sum, c) => sum + c.x, 0) / cells.length;
  let cy = cells.reduce((sum, c) => sum + c.y, 0) / cells.length;

  cells = cells.sort((a, b) => {
    let da = dist(a.x, a.y, cx, cy);
    let db = dist(b.x, b.y, cx, cy);
    return da - db;
  });

  
}

function draw_grid(){
  push();
    noFill();
    for (let cell of cells) {
      let x = cell.x;
      let y = cell.y;
      let size = cell.size;
      let sf = 100
      rect(x * sf, y * sf, size * sf, size * sf);
    }
  pop();
}



function getMaxSquareSize(gx, gy) {
  let max = min(gridCols - gx, gridRows - gy);
  for (let size = 1; size <= max; size++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[gy + y][gx + x]) return size - 1;
      }
    }
  }
  return max;
}

function chooseSize(max) {
  let options = [];
  for (let s = 1; s <= max; s++) {
    options.push(s);
  }
  return random(options); // try max for fewer small squares
}

function markFilled(gx, gy, size) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      grid[gy + y][gx + x] = true;
    }
  }
}

function draw_alignment_guide(){
  push();
    noFill();
    let sz = 20;
    let pz = MW*2
    target(pz, pz, sz)
    target(FW - pz, pz, sz);
    target(pz, FH - pz, sz);
    target(FW - pz, FH - pz, sz);
  pop();
}

function target(x, y, r){
  circle(x, y, r);
  line(x - r, y, x + r, y);
  line(x, y - r, x, y + r);
}



function setupSVG(){
  // Set important values for our SVG exporting: 
  setSvgResolutionDPI(DPI); // 96 is default
  setSvgPointRadius(0.25); // a "point" is a 0.25 circle by default
  setSvgCoordinatePrecision(4); // how many decimal digits; default is 4
  setSvgTransformPrecision(6); // how many decimal digits; default is 6
  setSvgIndent(SVG_INDENT_SPACES, 2); // or SVG_INDENT_NONE or SVG_INDENT_TABS
  setSvgDefaultStrokeColor('black'); 
  setSvgDefaultStrokeWeight(1); 
  setSvgFlattenTransforms(false); // if true: larger files, closer to original
}
