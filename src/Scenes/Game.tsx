import React, { useEffect } from "react";
import Matter, { Constraint, Vector, Body } from "matter-js";

const Game: React.FC = () => {
  const _setUpGame = () => {
    const gameRef = document.getElementById("gameDiv") as HTMLDivElement;

    var Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    var engine = Engine.create({
      // positionIterations: 20
    });
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;

    var render = Render.create({
      element: gameRef,
      engine: engine,
      options: {
        width: 600,
        height: 600,
        wireframes: false,
      },
    });

    var ballA = Bodies.circle(300, 300, 20, {
      restitution: 0.5,
    });
    var ballB = Bodies.circle(500, 500, 20, {
      restitution: 0.5,
    });
    ballA.collisionFilter.group = 2;
    ballB.collisionFilter.group = 2;
    World.add(engine.world, [
      // walls
      Bodies.rectangle(300, 0, 600, 20, {
        isStatic: true,
      }),
      Bodies.rectangle(300, 600, 600, 20, {
        isStatic: true,
      }),
      Bodies.rectangle(0, 300, 20, 600, {
        isStatic: true,
      }),
      Bodies.rectangle(600, 300, 20, 600, {
        isStatic: true,
      }),
    ]);

    World.add(engine.world, [ballA, ballB]);

    // add mouse controls
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0,
          render: {
            visible: false,
          },
        } as Constraint,
      });

    World.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, "mousedown", function (event) {
      const targetAngle = Matter.Vector.angle(ballA.position, mouse.position);
      const distance = ballA.circleRadius ?? 25 + 10;

      let spawnPosition = Vector.create(ballA.position.x, ballA.position.y);

      spawnPosition.x += Math.cos(targetAngle) * distance;
      spawnPosition.y += Math.sin(targetAngle) * distance;

      const bullet = Bodies.circle(spawnPosition.x, spawnPosition.y, 10);
      bullet.collisionFilter.group = 1;

      Body.setMass(bullet, 1000);
      const force = 10;

      setTimeout(() => {
        Matter.World.remove(engine.world, bullet);
      }, 1500);

      Matter.World.add(engine.world, bullet);
      Matter.Body.setVelocity(bullet, {
        x: Math.cos(targetAngle) * force,
        y: Math.sin(targetAngle) * force,
      });
    });

    document.addEventListener("keydown", (event) => {
      const speed = 5;
      if (event.keyCode === 68) {
        const vector = Vector.create(1 * speed, 0);
        Matter.Body.setVelocity(ballA, vector);
      }
      if (event.keyCode === 65) {
        const vector = Vector.create(-1 * speed, 0);
        Matter.Body.setVelocity(ballA, vector);
      }
      if (event.keyCode === 87) {
        const vector = Vector.create(0, -1 * speed);
        Matter.Body.setVelocity(ballA, vector);
      }
      if (event.keyCode === 83) {
        const vector = Vector.create(0, 1 * speed);
        Matter.Body.setVelocity(ballA, vector);
      }
    });

    Engine.run(engine);

    Render.run(render);
  };
  useEffect(() => {
    _setUpGame();
  });

  return <div id={"gameDiv"}></div>;
};

export default Game;
