const { vector: { Vector2 }, comm } = require("bytearena-sdk");

const computeAvoidanceForce = require("./computeAvoidanceForce");

let specs = null;

const agent = comm.connect();

agent.on("perception", perception => {
    const avoidanceForce = computeAvoidanceForce(perception, specs);
    const speed = specs.maxspeed;
    const seekingForce = new Vector2(
        Math.random() * 30 * (Math.random() > 0.5 ? -1 : 1),
        Math.random() * 30 * (Math.random() > 0.5 ? -1 : 1)
    );

    const actions = [];

    for (const otheragentkey in perception.vision) {
        const otheragent = perception.vision[otheragentkey];
        if (otheragent.tag !== "agent") continue;

        actions.push({ Method: 'shoot', Arguments: Vector2.fromArray(otheragent.center).add(Vector2.fromArray(otheragent.velocity)).toArray(5) });
    }

    steering = new Vector2()
        .add(avoidanceForce.clone().mag(100))
        .add(seekingForce.clone().mag(1))
        .mag(speed);

    actions.push({ Method: "steer", Arguments: steering.toArray(5) });

    // Pushing batch of mutations
    agent.takeActions(actions);
});

agent.on("welcome", _specs => (specs = _specs));
