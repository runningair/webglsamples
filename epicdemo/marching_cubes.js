// Marching cubes in Javascript
//
// Extremely badly and suboptimally implemented.
//
// Yes, this is madness. But this should test those JS engines!
//
// Converted from the standard C implementation that's all over the web.

function VertexInterp(isolevel,p1,p2,valp1,valp2, i) {

  if (Math.abs(isolevel-valp1) < 0.00001) return new Float32Array(p1)
  if (Math.abs(isolevel-valp2) < 0.00001) return p2
  if (Math.abs(valp1-valp2)    < 0.00001) return p1

  var mu = (isolevel - valp1) / (valp2 - valp1);
  var pout = new Float32Array(3)
  pout[0] = p1[0] + mu * (p2[0] - p1[0]);
  pout[1] = p1[1] + mu * (p2[1] - p1[1]);
  pout[2] = p1[2] + mu * (p2[2] - p1[2]);
  /*
  if (isNaN(pout[0])) alert("x" + p1[0] + " " + p2[0] + ": " + i)
  if (isNaN(pout[1])) alert("y" + p1[1] + " " + p2[1] + ": " + i)
  if (isNaN(pout[2])) alert("z" + p1[2] + " " + p2[2] + ": " + i)
  */
  return pout
}

// Returns total number of triangles. Fills triangles.
function polygonize(grid, isolevel, verts) {
  // Determine the index into the edge table which
  // tells us which vertices are inside of the surface
  var cubeindex = 0;
  if (grid.val[0] < isolevel) cubeindex |= 1;
  if (grid.val[1] < isolevel) cubeindex |= 2;
  if (grid.val[2] < isolevel) cubeindex |= 4;
  if (grid.val[3] < isolevel) cubeindex |= 8;
  if (grid.val[4] < isolevel) cubeindex |= 16;
  if (grid.val[5] < isolevel) cubeindex |= 32;
  if (grid.val[6] < isolevel) cubeindex |= 64;
  if (grid.val[7] < isolevel) cubeindex |= 128;

  var bits = edgeTable[cubeindex]

  // If cube is entirely in/out of the surface - bail, nothing to draw.
  if (bits == 0) return 0;

  var vertlist = []

  // Find the vertices where the surface intersects the cube
  if (bits & 1)    vertlist[0]  = VertexInterp(isolevel, grid.p[0], grid.p[1], grid.val[0], grid.val[1]);
  if (bits & 2)    vertlist[1]  = VertexInterp(isolevel, grid.p[1], grid.p[2], grid.val[1], grid.val[2]);
  if (bits & 4)    vertlist[2]  = VertexInterp(isolevel, grid.p[2], grid.p[3], grid.val[2], grid.val[3]);
  if (bits & 8)    vertlist[3]  = VertexInterp(isolevel, grid.p[3], grid.p[0], grid.val[3], grid.val[0]);
  if (bits & 16)   vertlist[4]  = VertexInterp(isolevel, grid.p[4], grid.p[5], grid.val[4], grid.val[5]);
  if (bits & 32)   vertlist[5]  = VertexInterp(isolevel, grid.p[5], grid.p[6], grid.val[5], grid.val[6]);
  if (bits & 64)   vertlist[6]  = VertexInterp(isolevel, grid.p[6], grid.p[7], grid.val[6], grid.val[7]);
  if (bits & 128)  vertlist[7]  = VertexInterp(isolevel, grid.p[7], grid.p[4], grid.val[7], grid.val[4]);
  if (bits & 256)  vertlist[8]  = VertexInterp(isolevel, grid.p[0], grid.p[4], grid.val[0], grid.val[4]);
  if (bits & 512)  vertlist[9]  = VertexInterp(isolevel, grid.p[1], grid.p[5], grid.val[1], grid.val[5]);
  if (bits & 1024) vertlist[10] = VertexInterp(isolevel, grid.p[2], grid.p[6], grid.val[2], grid.val[6]);
  if (bits & 2048) vertlist[11] = VertexInterp(isolevel, grid.p[3], grid.p[7], grid.val[3], grid.val[7]);

  // Change cubeindex into an offset into triTable.
  cubeindex <<= 4

  var numtris = 0;
  var i = 0;
  while (triTable[cubeindex + i] != -1) {
    var i0 = triTable[cubeindex + i + 0]
    var i1 = triTable[cubeindex + i + 1]
    var i2 = triTable[cubeindex + i + 2]
    if (i0 == i1 || i1 == i2 || i2 == i0) alert("degenerate")
    verts[i + 0] = vertlist[i0];
    verts[i + 1] = vertlist[i1];
    verts[i + 2] = vertlist[i2];
    i += 3;
    numtris++;
  }
  return numtris;
}

// Basic sample effect that actually draws something.
// Good starting point for new effects.
function MarchingCubesEffect() {
  var arrays = tdl.primitives.createCube(1.0)
  var program = createProgramFromTags("spinning_cube_vs", "spinning_cube_fs")
  var textures = []

  var proj = new Float32Array(16)
  var view = new Float32Array(16)
  var world = new Float32Array(16)

  var viewproj = new Float32Array(16)
  var worldviewproj = new Float32Array(16)

  var model = new tdl.models.Model(program, arrays, textures);

  var eyePosition = new Float32Array([0, 0, 4])
  var target = new Float32Array([0, 0, 0])

  // Marching cubes data
  var size = 20
  var field = new Float32Array(size * size * size)

  var m4 = tdl.fast.matrix4

  m4.perspective(proj, tdl.math.degToRad(60), aspect, 0.1, 500);
  m4.lookAt(view, eyePosition, target, up);

  this.render = function(framebuffer, time, global_time) {
    m4.rotationY(world, time)
    m4.translate(world, [0, 0*Math.sin(time)*0.5, 0])
    m4.mul(viewproj, view, proj)
    m4.mul(worldviewproj, world, viewproj)

    gl.clearColor(0.2,0.2,0.2,1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    var uniformsConst = {
      u_worldviewproj: worldviewproj
    }
    var uniformsPer = {
      u_worldviewproj: worldviewproj
    }

    model.drawPrep(uniformsConst)

    for (var i = 0; i < size * size * size; i++) {
      field[i] = 0.0
    }

    // Fill the field
    for (var i = 0; i < 2; i++) {
      for (var z = 0; z < size; z++) {
        var z_offset = size * size * z;
        var fz = (z - (size/2)) / (size/2)
        for (var y = 0; y < size; y++) {
          var y_offset = z_offset + size * y;
          var fy = (y - (size/2)) / (size/2)
          for (var x = 0; x < size; x++) {
            var fx = (x - (size/2)) / (size/2)
            if (i == 1) fx -= Math.sin(time) * 2;
            var ffy = fy

            var val = 1.0/(0.15 + fx * fx + ffy * ffy + fz * fz) * 0.07
            field[y_offset + x] += val
          }
        }
      }
    }

    var isolevel = 0.3// + Math.sin(time) * 0.04

    imm.begin(gl.TRIANGLES, program)
    var d = 1.0 / (size / 2);
    var yd = size
    var zd = size * size

    for (var z = 0; z < size - 1; z++) {
      var z_offset = size * size * z;
      var fz = (z - (size/2)) / (size/2) //+ 1
      for (var y = 0; y < size - 1; y++) {
        var y_offset = z_offset + size * y;
        var fy = (y - (size/2)) / (size/2) //+ 1
        for (var x = 0; x < size - 1; x++) {
          var fx = (x - (size/2)) / (size/2) //+ 1
          var q = y_offset + x
          var grid = { p: [ [fx,   fy,   fz  ],
                            [fx+d, fy,   fz  ],
                            [fx+d, fy+d, fz  ],
                            [fx,   fy+d, fz  ],
                            [fx,   fy,   fz+d],
                            [fx+d, fy,   fz+d],
                            [fx+d, fy+d, fz+d],
                            [fx,   fy+d, fz+d]
                          ],
                   val: [ field[q          ],
                          field[q+1        ],
                          field[q+1+ yd    ],
                          field[q+   yd    ],
                          field[q+       zd],
                          field[q+1+     zd],
                          field[q+1+ yd+ zd],
                          field[q+   yd+ zd]
                        ]
                 }
          var verts = []
          var numtris = polygonize(grid, isolevel, verts)
          for (var i = 0; i < numtris; i++) {
            imm.posv(verts[i * 3 + 0]); imm.next()
            imm.posv(verts[i * 3 + 1]); imm.next()
            imm.posv(verts[i * 3 + 2]); imm.next()
          }
        }
      }
    }
    imm.end()
  }
}
