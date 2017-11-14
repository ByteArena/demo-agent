const { vector: { Vector2 }, comm } = require('bytearena-sdk');

const computeAvoidanceForce = require('./computeAvoidanceForce');

const agent = comm.connect()

agent.on('perception', (perception, sendMutations) => {
    const avoidanceForce = computeAvoidanceForce(perception);
    const speed = perception.specs.maxspeed;
    const seekingForce = new Vector2(Math.random() * 30 * (Math.random() > .5 ? -1 : 1), Math.random() * 30 * (Math.random() > .5 ? -1 : 1));

    const moves = [];

    steering = (new Vector2())
        .add(avoidanceForce.clone().mag(100))
        .add(seekingForce.clone().mag(1))
        .mag(speed);

    moves.push({ Method: 'steer', Arguments: steering.toArray(5) });
    moves.push({ Method: 'shoot', Arguments: [0, 10] });

    // Pushing batch of mutations
    sendMutations(moves)
})

agent.on('specs', (x) => console.log(x))
