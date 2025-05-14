const AGENT_RADIUS = 1;
const AGENT_SPACING = 4;
const MAX_SPEED = 10;
const MAX_FORCE = 0.1;
const EDGES = 0.025
class Agent {
  constructor(position, velocity, group) {
    this.position = position.copy();
    this.group = group;

    this.velocity = velocity.copy();
    this.acceleration = createVector(0, 0);

    this.mass         = 20;
    this.radius       = AGENT_RADIUS;
    this.separating    = false;
  }

  checkEdges() {
    // Bounce off canvas edges with damping
    if (this.position.x - this.radius < 0) {
      this.position.x = this.radius;
      this.velocity.x *= -EDGES;
      this.addForce(createVector(1, 0));
    } else if (this.position.x + this.radius > W) {
      this.position.x = W - this.radius;
      this.velocity.x *= -EDGES;
      this.addForce(createVector(-1, 0));
    }

    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.velocity.y *= -EDGES;
      this.addForce(createVector(0, 1));
    } else if (this.position.y + this.radius > H) {
      this.position.y = H - this.radius;
      this.velocity.y *= -EDGES;
      this.addForce(createVector(0, -1));
    }
  }

  checkCollision() {
    let count = 0;
    for(let drop of drops){
      if(drop === this.group) continue; 
      for (let other of drop.agents) {
        if (this === other) continue;

        const d = this.position.dist(other.position);
        const minDist = AGENT_RADIUS

        if (d <= minDist) {
          // Resolve overlap
          const normal = p5.Vector.sub(other.position, this.position).normalize();
          const relVel = p5.Vector.sub(other.velocity, this.velocity);

          // Basic impulse
          const impulseMag = 2 * p5.Vector.dot(relVel, normal) / 2;
          const impulse = p5.Vector.mult(normal, impulseMag);
          const correction = p5.Vector.mult(normal, minDist - d);

          this.addForce(impulse.copy().div(this.mass));
          other.addForce(impulse.copy().div(-other.mass));

          // Positional correction
          this.addForce(correction.copy().div(-this.mass));
          other.addForce(correction.copy().div(other.mass));
          count++;
        }
      }
    }
    return count;
  }

  addForce(force, limit = MAX_FORCE) {
    force.limit(limit);
    this.velocity.add(force);
    this.velocity.limit(MAX_SPEED);
  }

  update(){
    this.checkCollision();
    this.checkEdges();
    this.position.add(this.velocity);
    this.velocity.mult(0.1);
  }



  draw(){
    circle(this.position.x, this.position.y, this.radius * 2);
  }

  in(drop){
    let inside = false;

    for(let i = 0, j = drop.agents.length - 1; i < drop.agents.length; j = i++) {
      let xi = drop.agents[i].position.x, yi = drop.agents[i].position.y;
      let xj = drop.agents[j].position.x, yj = drop.agents[j].position.y;

      // Check if the point is on an edge or vertex
      if ((this.position.y > yi) != (this.position.y > yj) && (this.position.x < (xj - xi) * (this.position.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

}

