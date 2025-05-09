let DPI = 96;
let wi = 10;
let hi = 14;
let bwi = 1/3;

const W = wi * DPI;
const H = hi * DPI;
const BW = bwi * DPI;

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

let drops = [];
let t =0 ;
let max_t = 500
let spoke_time = 20;

let current_colour = 0;
let DROP_INTERVAL = 40;

let granularity = 5;
let MAX_DROPS = 30;
let NDROPS = 0;

let u = 0.5;
const NPOS = 30/(2*u);
const INCR_SIZE = 10*u;
const BASE_SIZE = 50*u;
const SHORT = 10/u;
const LONG = 50/u;

function setup() {
  createCanvas(W, H);
  frameRate(30);
  pixelDensity(1);
  create_positions(NPOS);
  add_drops(positions, 0, 0);

  p5grain.setup();

}

function draw() {
  background(bg);

  

  if(t % DROP_INTERVAL == 0){
    NDROPS++;
    t = 0;
    
    
    previous_colour = current_colour;

    if(NDROPS % 3 == 0) {
      DROP_INTERVAL = int(random(LONG, LONG*2));
      add_drops_at_end();
      add_drops_at_end();
      add_drops_at_end();
      create_positions(10)
    } else {
      DROP_INTERVAL= int(random(SHORT, SHORT*2));

      recurse_positions();
    }

    current_colour = (previous_colour + 1) % palette.length;
    if(current_colour == palette.length - 1){ current_colour = 1 }

    add_drops(positions, NPOS, current_colour);
  }

  add_more_drops(positions, 0, current_colour);

  

  if(NDROPS > MAX_DROPS){
    noLoop();

    for(let i = 0; i < 40; i++){
      add_drops_at_end();
    }

  }

  push();
  translate(BW, BW);

  draw_drops();
  
  pop();

  draw_borders();
  
  granulateSimple(granularity)

  t++;  

  if(NDROPS > MAX_DROPS){
    saveCanvas('marbling', 'png');
    console.log("saved");
    noLoop();
  }
}

function add_drops_at_end(){
  create_positions(NPOS);
  current_colour = palette.length - random([1,2]);
  add_drops(positions, random(2,15), current_colour);
}


function draw_borders(){
  fill(bg);
  noStroke();
  rect(0, 0, W, BW);
  rect(0, 0, BW, H);
  rect(0, H - BW, W, BW);
  rect(W - BW, 0, BW, H);
}

let positions = [];

function create_positions(n){
  positions = [];
  for (let i = 0; i < n; i++) {
    let x = randomGaussian(W/2, W/3);
    let y = randomGaussian(H/2, H/3);
    let position = createVector(x, y);
    let overlaps = false;
    for(let other of positions){
      if (position.dist(other) < BASE_SIZE){
        overlaps = true;
        break
      }
    }
    if (!overlaps){
      positions.push(position);
    }
  }
}

function recurse_positions(){
  let new_positions = [];
  let quot = 3 * BASE_SIZE / (NDROPS % 6)
  for (let i = 0; i < positions.length; i++) {
    for(let j = 0; j < 2; j++){ 
      let x = randomGaussian(positions[i].x, quot);
      let y = randomGaussian(positions[i].y, quot);
      let position = createVector(x, y);
      let overlaps = false;
      for(let other of new_positions){
        if (position.dist(other) < quot){
          overlaps = true;
          break
        }
      }
      if (!overlaps){
        new_positions.push(position);
      }
    }
  }
  positions = new_positions;
}

function add_more_drops(positions){
  let tt = t%DROP_INTERVAL;
  let tmap = map(tt, 0, DROP_INTERVAL, INCR_SIZE, 1);
  

  for(let position of positions){
    marble_drops(position, tmap);
  }
}

function add_drops(positions, r = 10, idx){
  for(let position of positions){
    let drop = new Drop(position.x, position.y, r, idx);
    marble_drops(drop.position, drop.r)
    drops.push(drop); 
  }
}


function draw_drops(){
  for(let drop of drops){
    drop.draw();
  }
}

function marble_drops(position, r){
  for(let drop of drops){
    drop.marble(position, r);
  }
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('marbling', 'png');
  }
}
