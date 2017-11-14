const { vector: { Vector2 }, comm } = require('bytearena-sdk');

const computeAvoidanceForce = require('./computeAvoidanceForce');

let specs = null;

const agent = comm.connect();

agent.on('perception', perception => {
    const avoidanceForce = computeAvoidanceForce(perception, specs);
    const speed = specs.maxspeed;
    const seekingForce = new Vector2(Math.random() * 30 * (Math.random() > .5 ? -1 : 1), Math.random() * 30 * (Math.random() > .5 ? -1 : 1));

    const actions = [];

    steering = (new Vector2())
        .add(avoidanceForce.clone().mag(100))
        .add(seekingForce.clone().mag(1))
        .mag(speed);

    actions.push({ Method: 'steer', Arguments: steering.toArray(5) });
    actions.push({ Method: 'shoot', Arguments: [0, 10] });

    // Pushing batch of mutations
    agent.takeActions(actions)
})

agent.on('welcome', _specs => (specs = _specs));
