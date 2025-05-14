const RES = 200;
const SPACING_FACTOR = 1.25;
const MAX_AGE = 100;  
const DISPERSION_RATIO = 0.5;
class Group {
  constructor(x, y, radius, idx) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.position = createVector(x, y); 
    this.idx = idx;

    this.agents = [];
    this.springs = [];
    this.initialize(radius);
    this.age = 0;
    this.inside = false;
    this.parent = null;
    this.children = [];
    this.dispersion_factor = 1;

  }

  initialize(radius) {
    let resolution = this.calculate_resolution();

    for (let i = 0; i < resolution; i++) {
      let angle = map(i, 0, resolution, 0, TWO_PI);
      let p = createVector(cos(angle), sin(angle));
      p.mult(radius).add(this.position);
      let v = p5.Vector.sub(p, this.position).normalize();  
      v.mult(1)
      let agent = new Agent(p, v, this);
      this.agents.push(agent);
    }

    for (let stride = 1; stride <= 4; stride++) {
      for (let i = 0; i < this.agents.length; i++) {
        const a = this.agents[i];
        const b = this.agents[(i + stride) % this.agents.length];
        const length = dist(a.position.x, a.position.y, b.position.x, b.position.y);
        this.springs.push(new Spring(a, b, length, 0.05));
      }
    }    
  }

  calculate_resolution(){
    let r = this.radius;
    let res = Math.floor(TWO_PI * r / (AGENT_RADIUS*2*SPACING_FACTOR));
    
    return res;
  }

  constrain(){
    let prev = this.agents[this.agents.length - 1].position;
  
    for(let i = 0; i < this.agents.length; i++){
      let agent = this.agents[i];
      let v = agent.position;
      let spring = this.springs[i];

      if(v.dist(prev) > spring.length*3){
        spring.update();
      }
      prev = v;
    }
  }

  disperse(agent){
    if(this.age > 100) { return; }
    
    let valid = true;
    for(let other of drops){
      if(other === this) continue; 
      if(agent.in(other)){
        valid = false;
        break;
      }
    }

    if(valid) { this.disp(agent); }
    if(this.parent) { this.disp(agent); }
  }



  disp(agent){
    let v = p5.Vector.sub(agent.position, this.position).normalize();  
    let sf = map(this.age, 0, MAX_AGE, this.dispersion_factor, 0);
    v.mult(sf);
    agent.addForce(v);
  }

  contraction(){
    let should_contract = false;
    for(let other of drops){
      if(other === this) { continue; }

      for(let child of this.children){
        if(other === child) { continue; }
      }
      
      for(let agent of this.agents){
        for(let other_agent of other.agents){
          let dist = agent.position.dist(other_agent.position);
          if(dist < 2){
            should_contract = true;
            break;
          }
        }

        if(should_contract) break;
      }
    }

    if(should_contract){
      for(let agent of this.agents){
        this.contract(agent);
      }
    }
  }

  contract(agent){
    let v = p5.Vector.sub(agent.position, this.position).normalize();  
    v.mult(-1);
    agent.addForce(v);
  }

  update(){
    this.intersecting();
    // this.constrain();
    this.contraction();

    for(let spring of this.springs){
      spring.update();
    }
    
    let new_position = createVector(0,0)
    for(let agent of this.agents){
      this.disperse(agent);
      agent.update()
      agent.separating = false;
      new_position.add(agent.position);
    }

    this.position = new_position.copy().div(this.agents.length);
    this.age++;
  }

  marble(position, r) {  
    for(let agent of this.agents){
      let p = agent.position.copy();
      p.sub(position);
      let m = p.mag();
      let root = sqrt(1 + (r * r) / (m * m));
      
      p.mult(root);
      p.add(position);
      agent.position.set(p);
    }   
    
  }


  intersecting(){
    let n = this.agents.length;
    for(let drop of drops){
      if(drop === this) continue; 

      let count = this.number_of_agents_in(drop);
      
      if(count > 0 && count < n){
        for(let agent of this.agents){
          agent.separating = true;
        }
        return true;
      }
    }

    return false;
  }

  // FIX THE NAMING AND LOGIC
  wrong_logic(drop){
    if(drop === this) return false;

    let count = this.number_of_agents_in(drop);
    let it_works = (count == this.agents.length);

    if(it_works){
      console.log(drop.idx, "contains", this.idx);
      return true;
    } else {
      console.log(drop.idx, "does not contain", this.idx);
      return false;
    }

  }

  contains(drop){
    return drop.wrong_logic(this);
  }

  number_of_agents_in(drop){
    if(drop === this) return 0;

    let count = 0;
    for (let agent of this.agents) {

      if(agent.in(drop)){
        count++;
      }
    }

    return count;
  }

  clean_vertices(){
    let new_vertices = [];
    for(let agent of this.agents){
      let p = agent.position.copy();
      new_vertices.push(p);
    }

    // let cleaned = chaikin(new_vertices, 8);

    // beginShape();
    //   for (let v of cleaned) {
    //     vertex(v.x, v.y);
    //   }
    // endShape(CLOSE);

    // drawSmoothCurve(new_vertices, 10);

    drawBSpline(new_vertices, 48);

  }

  draw() {
    if(debug){
      noFill();
      strokeWeight(2);
    } else {
      fill(palette[this.idx]);
      noStroke();
    }

    beginShape();
    for (let agent of this.agents) {
      let p = agent.position.copy();
      vertex(p.x, p.y);
    }
    endShape(CLOSE);

   

    if(debug){
      fill(palette[this.idx]);
      for(let agent of this.agents){
        agent.draw();
      }

      circle(this.position.x, this.position.y, 5);

      noFill();
      strokeWeight(1);
      for(let spring of this.springs){
        spring.draw();
      }
    }
  }
}


// Chaikin smoothing: returns a *new* array of p5.Vector
function chaikin(points, iterations) {
  let pts = points.slice();
  for (let k = 0; k < iterations; k++) {
    let next = [];
    for (let i = 0; i < pts.length; i++) {
      let p0 = pts[i];
      let p1 = pts[(i + 1) % pts.length];
      // Q = 3/4*p0 + 1/4*p1
      next.push(createVector(
        0.75 * p0.x + 0.25 * p1.x,
        0.75 * p0.y + 0.25 * p1.y
      ));
      // R = 1/4*p0 + 3/4*p1
      next.push(createVector(
        0.25 * p0.x + 0.75 * p1.x,
        0.25 * p0.y + 0.75 * p1.y
      ));
    }
    pts = next;
  }
  return pts;
}

function drawSmoothCurve(vertices, samplesPerEdge=10) {
  beginShape();
  // duplicate last two to feed into the spline
  let n = vertices.length;
  curveVertex(vertices[n-2].x, vertices[n-2].y);
  curveVertex(vertices[n-1].x, vertices[n-1].y);

  // for each original edge, sample along the spline
  for (let i = 0; i < n; i++) {
    let prev = vertices[(i-1+n)%n];
    let curr = vertices[i];
    let next = vertices[(i+1)%n];
    let next2 = vertices[(i+2)%n];
    // generate intermediate points by t = 0..1 in samplesPerEdge steps
    for (let s = 0; s <= samplesPerEdge; s++) {
      let t = s / samplesPerEdge;
      // Catmull–Rom formula courtesy of p5.js's internal
      let x = curvePoint(prev.x, curr.x, next.x, next2.x, t);
      let y = curvePoint(prev.y, curr.y, next.y, next2.y, t);
      curveVertex(x, y);
    }
  }

  // close the loop
  curveVertex(vertices[0].x, vertices[0].y);
  curveVertex(vertices[1].x, vertices[1].y);
  endShape(CLOSE);
}


// evaluate a single point on a uniform cubic B-spline
function bsplinePoint(ctrlPts, t) {
  let n = ctrlPts.length;
  // wrap indices
  let i = floor(t * n);
  let f = t * n - i;
  // get four consecutive control points
  let p0 = ctrlPts[(i-1 + n)%n];
  let p1 = ctrlPts[i % n];
  let p2 = ctrlPts[(i+1)%n];
  let p3 = ctrlPts[(i+2)%n];
  // basis functions
  let b0 = ((-f+2)*f - 1)*f/2;
  let b1 = (((3*f - 5)*f)*f + 2)/2;
  let b2 = ((-3*f + 4)*f + 1)*f/2;
  let b3 = ((f - 1)*f*f)/2;
  return createVector(
    p0.x*b0 + p1.x*b1 + p2.x*b2 + p3.x*b3,
    p0.y*b0 + p1.y*b1 + p2.y*b2 + p3.y*b3
  );
}

function drawBSpline(verts, samples=200) {
  beginShape();
  let p = bsplinePoint(verts, 0);
  curveVertex(p.x, p.y);
  for (let i = 0; i <= samples; i++) {
    let t = i / samples;
    let p = bsplinePoint(verts, t);
    curveVertex(p.x, p.y);
  }
  let p1 = bsplinePoint(verts, 1);
  curveVertex(p1.x, p1.y);
  let p2 = bsplinePoint(verts, 0);
  curveVertex(p2.x, p2.y);

  endShape(CLOSE);
}



