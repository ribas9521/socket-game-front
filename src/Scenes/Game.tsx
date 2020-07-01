import React, { useEffect } from "react";
import Matter, { Constraint, Vector } from "matter-js";

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

    var ballA = Bodies.circle(210, 100, 30, {
      restitution: 0.5,
    });

    World.add(engine.world, [
      // walls
      Bodies.rectangle(300, 0, 600, 10, {
        isStatic: true,
      }),
      Bodies.rectangle(300, 600, 600, 10, {
        isStatic: true,
      }),
      Bodies.rectangle(0, 300, 10, 600, {
        isStatic: true,
      }),
      Bodies.rectangle(600, 300, 10, 600, {
        isStatic: true,
      }),
    ]);

    World.add(engine.world, [ballA]);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        } as Constraint,
      });

    World.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, "mousedown", function (event) {
      const targetAngle = Matter.Vector.angle(ballA.position, mouse.position);
      const bullet = Bodies.circle(ballA.position.x, ballA.position.y, 5);
      Matter.Body.setMass(bullet, 10000);
      const force = 100;
      Matter.World.add(engine.world, bullet);
      Matter.Body.applyForce(bullet, bullet.position, {
        x: Math.cos(targetAngle) * force,
        y: Math.sin(targetAngle) * force,
      });
    });

    document.addEventListener("keydown", (event) => {
      const speed = 2;
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
