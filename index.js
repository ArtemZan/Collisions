var canvas
var ctx

var keysState = []

class Object {
    constructor(vertices, color, position) {
        this.vertices = vertices
        this.color = color
        this.pos = new vec2(0.0, 0.0);
        this.dir = new vec2(0.0, 1.0)

        if (position !== undefined) {
            this.Move(position)
        }
    }

    Move(bias) {
        for (let v of this.vertices) {
            v.x += bias.x
            v.y += bias.y
        }
        this.pos.x += bias.x;
        this.pos.y += bias.y;
    }

    MoveTo(new_pos) {
        for (let v of this.vertices) {
            v.x += new_pos.x - this.pos.x
            v.y += new_pos.y - this.pos.y
        }
        this.pos = new_pos
    }

    Rotate(angle) {
        var p = new vec2(this.pos.x, this.pos.y)
        this.Move(scale(p, -1))
        for (let v of this.vertices) {
            v.rotate(angle)
        }
        this.Move(p)
        this.dir.rotate(angle);
    }
}

var objects = []
var currentObject = -1;

class Matrix2x2 {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    multiply(matrix) {
        if (matrix instanceof Matrix2x2) {
            var v = new vec2(this.x, this.y)
            this.x = matrix.x1 * v.x + matrix.x2 * v.y;
            this.y = matrix.y1 * v.x + matrix.y2 * v.y;
        }
    }

    scale(k) {
        this.x *= k;
        this.y *= k;
    }

    rotate(angle) {
        this.multiply(new Matrix2x2(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle)));
    }

    normalize() {
        let l = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.x /= l
        this.y /= l
    }
}

function multiply(vec, matrix) {
    if (vec instanceof vec2) {
        var res = vec
        res.multiply(matrix);
        return res;
    }
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function minus(v1, v2) {
    return new vec2(v1.x - v2.x, v1.y - v2.y)
}

function scale(vec, k) {
    var res = new vec2(vec.x, vec.y);
    res.scale(k);
    return res
}

function rotate(vec, angle) {
    var res = new vec2(vec.x, vec.y)
    res.rotate(angle)
    return res;
}


window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d")
    //line(new vec2(0.0, 0.0), new vec2(1000.0, 1000.0), "#000000")
    //draw([new vec2(100, 100), new vec2(200, 100), new vec2(115, 200), new vec2(100, 170), new vec2(50, 150), new vec2(90, 120)], "#ff0000", true)
    var o = new Object([new vec2(0, -50), new vec2(100, -50), new vec2(15, 50), new vec2(0, 20), new vec2(-50, 0), new vec2(-10, -30)], "#ff0000", new vec2(300, 500))
    objects.push(o);
    o = new Object([new vec2(-50, -50), new vec2(50, -50), new vec2(50, 50), new vec2(-50, 50)], "#aaff00", new vec2(300, 200))
    objects.push(o);
    o = new Object([new vec2(-50, -50), new vec2(50, -50), new vec2(50, 50), new vec2(-50, 50)], "#aaff00", new vec2(600, 100))
    objects.push(o);
    currentObject = 0;
    loop()
}

window.onkeydown = function (e) {
    keysState[e.key] = true;
}

window.onkeyup = function (e) {
    keysState[e.key] = false;
}

//separating axis theorem
function DoCollide(o1, o2) {
    for (let i = 0; i < 2; i++) {
        if(i === 1)
        {
            let o = o1
            o1 = o2
            o2 = o
        }

        for (let a1 = 0; a1 < o1.vertices.length - 1; a1++) {
            var axis = minus(o1.vertices[a1], o1.vertices[a1 + 1]);
            axis.normalize();
            axis.rotate(Math.PI / 2)
            var min1 = Infinity;
            var max1 = -Infinity;
            var min2 = Infinity;
            var max2 = -Infinity;

            for (let v1 = 0; v1 < o1.vertices.length; v1++) {
                var d = dot(axis, o1.vertices[v1])
                if (d < min1)
                    min1 = d;
                if (d > max1)
                    max1 = d;
            }

            for (let v2 = 0; v2 < o2.vertices.length; v2++) {
                var d = dot(axis, o2.vertices[v2])
                if (d < min2)
                    min2 = d;
                if (d > max2)
                    max2 = d;
            }

            //console.log(min1, min2, max1, max2)
            if(min1 > max2 || min2 > max1)
                return false
        }
    }

    return true
}


function HandleInput() {
    const speed = 5
    if (currentObject !== -1) {
        if (keysState["w"]) {
            objects[currentObject].Move(scale(objects[currentObject].dir, speed));
            for(let i = 0; i < objects.length; i++)
            {
                if(i === currentObject)
                    continue
                if(DoCollide(objects[currentObject], objects[i]))
                {
                    objects[currentObject].Move(scale(objects[currentObject].dir, -speed));
                }
            }
        }
        if (keysState["s"]) {
            objects[currentObject].Move(scale(objects[currentObject].dir, -speed));
            for(let i = 0; i < objects.length; i++)
            {
                if(i === currentObject)
                    continue
                if(DoCollide(objects[currentObject], objects[i]))
                {
                    objects[currentObject].Move(scale(objects[currentObject].dir, speed));
                }
            }
        }
        if (keysState["a"]) {
            objects[currentObject].Rotate(-0.1);
            for(let i = 0; i < objects.length; i++)
            {
                if(i === currentObject)
                    continue
                if(DoCollide(objects[currentObject], objects[i]))
                {
                    objects[currentObject].Rotate(0.1);
                }
            }
        }
        if (keysState["d"]) {
            objects[currentObject].Rotate(0.1);
            for(let i = 0; i < objects.length; i++)
            {
                if(i === currentObject)
                    continue
                if(DoCollide(objects[currentObject], objects[i]))
                {
                    objects[currentObject].Rotate(-0.1);
                }
            }
        }
    }
}

function line(start, end, color) {
    if (color !== undefined) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}

function drawVertices(vertices, color, fill) {
    if (color !== undefined) {
        if (fill) {
            ctx.fillStyle = color;
        }
        else {
            ctx.strokeStyle = color;
        }
    }
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y)
    }
    ctx.lineTo(vertices[0].x, vertices[0].y)
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (o of objects) {
        drawVertices(o.vertices, o.color, true)
    }
}

function loop() {
    //objects[0].MoveTo(new vec2(Math.sin(Date.now() / 200) * 100.0 + 100.0, 0.0))
    HandleInput()

    draw()
    setTimeout(window.requestAnimationFrame, 20, loop)
}