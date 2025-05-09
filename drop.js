let RES = 200;
class Drop {
  constructor(x, y, r, idx) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.position = createVector(x, y); 
    this.idx = idx;

    this.vertices = [];
    this.initialize();
  }

  initialize() {
    for (let i = 0; i < RES; i++) {
      let angle = map(i, 0, RES, 0, TWO_PI);
      let v = createVector(cos(angle), sin(angle));
      v.mult(this.r).add(this.position);
      this.vertices[i] = v;
    }
  }

  tine(m, x, y, z, c, idx = 0, offset) {
    // x, y is the position of the tine
    // m is the direction of the tine as a vector
    let u = 1 / pow(2, 1 / c);
    let b = createVector(x, y);
    for (let i =0; i < RES; i++) {
      let v = this.vertices[i];
      if(i > idx*60 + offset && i < idx*60 + 30 + offset){
        let pb = p5.Vector.sub(v, b);
        let n = m.copy().rotate(HALF_PI);
        let d = abs(pb.dot(n));
        let mag = z * pow(u, d);
        v.add(m.copy().mult(mag));
      }
    }
  }

 

  marble(position, r) {  
    for(let v of this.vertices){
      let p = v.copy();
      p.sub(position);
      let m = p.mag();
      let root = sqrt(1 + (r * r) / (m * m));
      p.mult(root);
      p.add(position);
      v.set(p);
    }   
    
  }


  draw() {
    fill(palette[this.idx]);
    noStroke();

    beginShape();
    for(let v of this.vertices){
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}
