let DPI = 96;
let wi = 5;
let hi = 7;
let bwi = 1/3;
let mwi = 1/3;

const W = wi * DPI;
const H = hi * DPI;
const BW = bwi * DPI;
const MW = mwi * DPI;

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

let debug = false;

let drops = [];
let t =0 ;
let paused  = false;
let max_t = 500
let spoke_time = 20;

let current_colour = 1;
let DROP_INTERVAL = 40;

let granularity = 5;
let MAX_DROPS = 12;
let NDROPS = 0;


let next_postions = [];

function setup() {
  createCanvas(W + 2*BW, H+2*BW);
  frameRate(30);
  pixelDensity(1);

  p5grain.setup();
}

function draw() {
  background(bg);

  

  update_groups();

  push();
    translate(BW, BW);
    draw_drops();
    draw_borders();
  pop();
  
  granulateSimple(granularity)

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
  rect(0, 0, W, H);
}


function draw_drops(){
  for(let drop of drops){
    drop.draw();
  }
}

// TODO implement toroidal edges
// Try small tines which would make star/splats/spokes
// Try shading

function update_groups(){
  for(let drop of drops){
    
    // drop.update();

    
  }
}



function check_intersection(position, radius = BASE_SIZE){
  let overlaps = false;
  for(let other of positions){
    if (position.dist(other) < radius){
      overlaps = true;
      break
    }
  }
  return overlaps;
}

function mousePressed(){
  let x = mouseX - BW;
  let y = mouseY - BW;
  let r = 50;


  add_drop(x, y, r);

}

function add_drop(x, y, r){
  if(x < r || x > W - r || y < r || y > H - r){ return }
  if(!r) { return}
  let drop = new Group(x, y, r, current_colour);
  for(let other of drops){
    other.marble(drop.position, drop.r);
  }
  drops.push(drop);
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
