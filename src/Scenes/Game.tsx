import React, { useEffect } from "react";
import Matter, { Constraint, Vector, Body, Engine } from "matter-js";
import socketIOClient from "socket.io-client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PlayerInterface from "../Components/Player/types";
import Player from "../Components/Player/Player";
const ENDPOINT = "http://192.168.1.126:3333";

const Game: React.FC = () => {
  let playerId = "";
  let me: Matter.Body;
  let playerList: Player[] = [];

  const spawnPlayers = (
    engine: Matter.Engine,
    _playerList: PlayerInterface[]
  ) => {
    for (const player of _playerList) {
      const _player = new Player(player.x, player.y, player.id);
      Matter.World.add(engine.world, _player.body);
      playerList.push(_player);
    }
  };

  const playerAlreadySpawned = (engine: Matter.Engine, player: Player) => {
    return engine.world.bodies.filter((body) => body.label === player.id)
      .length;
  };

  const spawnPlayer = (engine: Matter.Engine, player: Player) => {
    if (!playerAlreadySpawned(engine, player)) {
      console.log("new player added", player);
      const _player = new Player(player.x, player.y, player.id);
      Matter.World.add(engine.world, _player.body);
      playerList.push(_player);
    }
  };

  const findPlayerById = (engine: Matter.Engine, playerId: string): Player => {
    return playerList.filter((_player) => _player.id === playerId)[0];
  };

  const spawnWalls = (engine: Matter.Engine) => {
    const rec1 = Matter.Bodies.rectangle(300, 0, 600, 20, {
      isStatic: true,
    });
    rec1.label = "wall";
    const rec2 = Matter.Bodies.rectangle(300, 600, 600, 20, {
      isStatic: true,
    });
    rec2.label = "wall";
    const rec3 = Matter.Bodies.rectangle(0, 300, 20, 600, {
      isStatic: true,
    });
    rec3.label = "wall";
    const rec4 = Matter.Bodies.rectangle(600, 300, 20, 600, {
      isStatic: true,
    });
    rec4.label = "wall";

    Matter.World.add(engine.world, [
      // walls
      rec1,
      rec2,
      rec3,
      rec4,
    ]);
  };

  const getMe = (engine: Matter.Engine) => {
    me = playerList
      .filter((_player) => _player.id === playerId)[0]
      .getSpawnedBody(engine);
    console.log(me.label);
    console.log(playerList);
  };

  const _setUpGame = () => {
    const gameRef = document.getElementById("gameDiv") as HTMLDivElement;

    var Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
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
    spawnWalls(engine);
    // add mouse controls
    const mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 1,
          render: {
            visible: false,
          },
        } as Constraint,
      });

    World.add(engine.world, mouseConstraint);

    const socket = socketIOClient(ENDPOINT);
    socket.on("connect", () => {
      playerId = socket.id;
    });

    socket.on("setup", (playerList: PlayerInterface[]) => {
      spawnPlayers(engine, playerList);
    });

    socket.on("add-player", (player: Player) => {
      spawnPlayer(engine, player);
      getMe(engine);
      Matter.Events.on(mouseConstraint, "mousedown", function (event) {
        const targetAngle = Matter.Vector.angle(me.position, mouse.position);
        const distance = (me.circleRadius ?? 50) + 10;

        let spawnPosition = Vector.create(me.position.x, me.position.y);

        spawnPosition.x += Math.cos(targetAngle) * distance;
        spawnPosition.y += Math.sin(targetAngle) * distance;

        const bullet = Matter.Bodies.circle(
          spawnPosition.x,
          spawnPosition.y,
          10
        );
        bullet.label = "bullet";

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
        if (event.keyCode === 68) {
          socket.emit("move-player", { id: me.label, movement: "right" });
        }
        if (event.keyCode === 65) {
          socket.emit("move-player", { id: me.label, movement: "left" });
        }
        if (event.keyCode === 87) {
          socket.emit("move-player", { id: me.label, movement: "up" });
        }
        if (event.keyCode === 83) {
          socket.emit("move-player", { id: me.label, movement: "down" });
        }
      });

      socket.on(
        "move-player",
        (movementObj: { id: string; movement: string }) => {
          const { id, movement } = movementObj;
          const _player = findPlayerById(engine, id);
          switch (movement) {
            case "up":
              _player.moveUp(engine);
              break;
            case "down":
              _player.moveDown(engine);
              break;
            case "left":
              _player.moveLeft(engine);
              break;
            case "right":
              _player.moveRight(engine);
              break;
          }
        }
      );
    });

    Matter.Events.on(engine, "collisionStart", (event) => {
      const collisions = event.pairs[0];
      if (collisions) {
        if (collisions.bodyA.label === "bullet") {
          Matter.World.remove(engine.world, collisions.bodyA);
        }
        if (collisions.bodyB.label === "bullet") {
          Matter.World.remove(engine.world, collisions.bodyB);
        }
        if (
          collisions.bodyA.label === "wall" &&
          collisions.bodyB.label === "player"
        ) {
          Matter.World.remove(engine.world, collisions.bodyB);
        }
        if (
          collisions.bodyA.label === "player" &&
          collisions.bodyB.label === "wall"
        ) {
          Matter.World.remove(engine.world, collisions.bodyA);
        }
      }
    });
    Engine.run(engine);

    Render.run(render);
  };
  useEffect(() => {
    _setUpGame();
  });

  return (
    <>
      <div id={"gameDiv"}></div>
    </>
  );
};

export default Game;
