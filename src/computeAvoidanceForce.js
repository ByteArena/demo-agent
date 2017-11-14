const { vector: { Vector2 } } = require('bytearena-sdk');

module.exports = function computeAvoidanceForce(perception, specs) {
    
    const agentvelocity = Vector2.fromArray(perception.internal.velocity);
    const agentradius = perception.internal.proprioception;
    const visionradius = specs.visionradius;

    // on évite les obstacles
    let avoidanceforce = new Vector2();
    if(perception.external.vision) {

        // normals
        const normals = agentvelocity.normals();

        // bordures couloir gauche et droite
        const bottomleft = normals[0].clone().mag(agentradius+0.5);          // 10 pixels plus large à gauche
        const bottomright = normals[1].clone().mag(agentradius+0.5);         // 10 pixels plus large à droite

        const topleft = bottomleft.clone().rotate(-Math.PI/2).mag(15).add(bottomleft);         // 15 u en avant
        const topright = bottomright.clone().rotate(Math.PI/2).mag(15).add(bottomright);       // 15 u en avant

        for(const otheragentkey in perception.external.vision) {
            const otheragent = perception.external.vision[otheragentkey];
            if(otheragent.tag !== "obstacle" && otheragent.tag !== "agent") continue;

            const otheragentvelocity = Vector2.fromArray(otheragent.velocity);

            const nearedge = Vector2.fromArray(otheragent.nearedge).add(otheragentvelocity);
            const faredge = Vector2.fromArray(otheragent.faredge).add(otheragentvelocity);
            const segment = faredge.clone().sub(nearedge);

            const edgestoavoid = [];

            // can be overlapping, but not sure yet (test has been made on an axis aligned bounding box, but the corridor is oriented, not aligned)

            if (pointInRectangle(nearedge, bottomleft, bottomright, topright, topleft)) {
                // nearedge IN CORRIDOR
                edgestoavoid.push(nearedge);
            }

            if(pointInRectangle(faredge, bottomleft, bottomright, topright, topleft)) {
                // FAREDGE IN CORRIDOR
                edgestoavoid.push(faredge);
            }

            // test corridor intersection with line segment
            let collision = Vector2.intersectionWithLineSegment(bottomleft, topleft, nearedge, faredge);
            if(collision.intersects && !collision.colinear) {
                // COLLISION LEFT
                edgestoavoid.push(collision.intersection);
            }

            collision = Vector2.intersectionWithLineSegment(bottomright, topright, nearedge, faredge);
            if(collision.intersects && !collision.colinear) {
                // COLLISION RIGHT
                edgestoavoid.push(collision.intersection);
            }

            collision = Vector2.intersectionWithLineSegment(bottomleft, bottomright, nearedge, faredge);
            if(collision.intersects && !collision.colinear) {
                // COLLISION BOTTOM
                edgestoavoid.push(collision.intersection);
            }

            collision = Vector2.intersectionWithLineSegment(topleft, topright, nearedge, faredge);
            if(collision.intersects && !collision.colinear) {
                // COLLISION TOP
                edgestoavoid.push(collision.intersection);
            }

            if(edgestoavoid.length > 0) {
                if(edgestoavoid.length !== 2) {
                    console.log("OBSTACLE in sight crossing safe tunnel only once; SOMETHING'S BROKEN !", edgestoavoid);
                } else {
                    const pointa = edgestoavoid[0];
                    const pointb = edgestoavoid[1];
                    const center = pointb.clone().add(pointa).div(2);

                    avoidanceforce.add(new Vector2(-100, 0));    // always turn left
                }
            }
        }
    }

    return avoidanceforce;
};

// taken from http://stackoverflow.com/a/37865332/3528924

function pointInRectangle(vP, vRA, vRB, vRC, vRD) {
    
    var AB = vRB.clone().sub(vRA);
    var AM = vP.clone().sub(vRA);
    var BC = vRC.clone().sub(vRB);
    var BM = vP.clone().sub(vRB);

    var dotABAM = AB.dot(AM);
    var dotABAB = AB.dot(AB);
    var dotBCBM = BC.dot(BM);
    var dotBCBC = BC.dot(BC);

    return 0 <= dotABAM && dotABAM <= dotABAB && 0 <= dotBCBM && dotBCBM <= dotBCBC;
};
