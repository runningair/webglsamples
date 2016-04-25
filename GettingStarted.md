I hope the code is pretty straight forward.

Briefly...

Your startup code should look like this

```
  canvas = document.getElementById("canvas");
  gl = tdl.webgl.setupWebGL("viewContainer", canvas);
  if (!gl) {
    return;  // Do nothing
  }
```

Where "canvas" is the id of the canvas you want to draw into and "viewContainer" is the id of a div that surrounds that canvas. tdl.webgl.setupWebGL will replace the contents of the canvas with a link to getting a WebGL capable browser if the user's browser does not support WebGL.

Otherwise...

Compiles your shaders and creates a Program object.
```
var program = tdl.programs.loadProgram(vertexShaderSource, fragmentShaderSource);
```

Loads your textures. The key names must match whatever you called the samplers in your shaders. loadTexture can take `[r,g,b,a]` for solid texture. `[url,url,url,url,url,url]` for a cubemap and also `[url]` for a cubemap where all 6 faces are in a cross. It can also take an img or canvas tag.

```
var textures = {
   name1: tdl.textures.loadTexture(url),
   name2: tdl.textures.loadTexture(url)};
```

Create vertices
```
var arrays = tdl.primitives.createSphere(1, 10, 10);
```

The primitive functions return an object like this
```
 {
    position: AttribBuffer,
    normal: AttribBuffer,
    texCoord: AttribBuffer
};
```

The key names must match the attributes in your vertex shader if you want to add more.

A call to tdl.primitives.addTangentsAndBinormals adds the fields "tangent" and "binormal"

Once you have all 3 you make a new model
```
var model = new tdl.models.Model(program, array, textures);
```

To draw the model there are 2 functions, model.drawPrep(uniformMap) and model.draw(uniformMap).

Both of them take an object with uniformName/value pairs.

model.drawPrep binds the program, binds all the textures and attributes and sets whatever uniforms you pass in.

model.draw sets any more uniforms you pass in and then calls gl.drawElements

The math is a little funky. There are 2 math libraries, math.js and fast.js.  math.js comes from O3D and uses `JavaScript` arrays. A Matrix in that library is a an array of numbers.  fast.js uses `Float32Array` for its storage and most functions take a destination object as the first argument. Theoretically this is faster because you can avoid a certain number of allocations. It also means the numbers in the array do not have to be queried and converted from `JavaScript` Number to floats before calling glUniform.