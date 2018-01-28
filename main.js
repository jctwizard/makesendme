const WIDTH = viewer.offsetWidth;
const HEIGHT = viewer.offsetHeight;

var camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, 0, 1000);
camera.position.set(0, 0, -100);
camera.lookAt(0, 0, 0);

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x222222 );

var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambient );

var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
light.position.set( 1, 1, -1 );
light.lookAt(0, 0, 0);
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( WIDTH, WIDTH );
viewer.appendChild( renderer.domElement );

var geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var globe = new THREE.Mesh( geometry, material );
globe.position.set(0, -0.5, 0);
scene.add(globe);

var selectedAsset;
var selectedFormat;

var skyUniforms, skyMaterial, skyMesh;
var landUniforms, landMaterial;
var objectUniforms, objectMaterial;

skyMesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial( {color: 0xffff00} ));

skyMesh.position.z = 100;
skyMesh.rotation.x = Math.PI;
skyMesh.position.y = -0.5

scene.add(skyMesh);

var objects = [];

var bubble = {};

var roomName = "bubble";

function init()
{
  viewer.addEventListener('mousedown', onMouseDown, false);

  searchPoly();

  setSkyColour(2, "distant galaxy");
  setLandColour(2, "jurassic coast");

  firebase.initializeApp(config);

  loadBubble(roomName);
}

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCtyO5e3BdcWxyR7YsKpTvA66dklMKDAcY",
  authDomain: "makesendme.firebaseapp.com",
  databaseURL: "https://makesendme.firebaseio.com",
  projectId: "makesendme",
  storageBucket: "makesendme.appspot.com",
  messagingSenderId: "593040807046"
};

function loadBubble(newRoomName)
{
  scene.remove(globe);

  globe = new THREE.Mesh( geometry, landMaterial );
  globe.position.set(0, -0.5, 0);
  scene.add(globe);

  objects = [];

  firebase.database().ref("bubbles/" + newRoomName + "/data").once("value").then(function(data)
  {
    bubble = data.val();

    setSkyColours(new THREE.Vector3(bubble["skyColour1"]["x"], bubble["skyColour1"]["y"], bubble["skyColour1"]["z"]), new THREE.Vector3(bubble["skyColour2"]["x"], bubble["skyColour2"]["y"], bubble["skyColour2"]["z"]));
    setLandColours(new THREE.Vector3(bubble["landColour1"]["x"], bubble["landColour1"]["y"], bubble["landColour1"]["z"]), new THREE.Vector3(bubble["landColour2"]["x"], bubble["landColour2"]["y"], bubble["landColour2"]["z"]));


    var bubbleObjects = bubble["objects"];

    for (var bubbleIndex = Object.keys(bubbleObjects).length - 1; bubbleIndex >= 0; bubbleIndex--)
    {
      var bubbleObject = bubbleObjects[bubbleIndex.toString()];
      loadBubbleObject(bubbleObject["rotation"], bubbleObject["id"], new THREE.Vector3(bubbleObject["colour1"]["x"], bubbleObject["colour1"]["y"], bubbleObject["colour1"]["z"]), new THREE.Vector3(bubbleObject["colour2"]["x"], bubbleObject["colour2"]["y"], bubbleObject["colour2"]["z"]));
    }
  });
}

function sendGame()
{
  setBubble();
}

function searchWorld()
{
  var worldName = document.getElementById("worldQuery").value;

  console.log(worldName);

  roomName = worldName;
  loadBubble(roomName);
}

function setBubble()
{
  firebase.database().ref("bubbles/" + roomName + "/data/skyColour1/x").set(skyColourOne.x);
  firebase.database().ref("bubbles/" + roomName + "/data/skyColour1/y").set(skyColourOne.y);
  firebase.database().ref("bubbles/" + roomName + "/data/skyColour1/z").set(skyColourOne.z);
  firebase.database().ref("bubbles/" + roomName + "/data/skyColour2/x").set(skyColourTwo.x);
  firebase.database().ref("bubbles/" + roomName + "/data/skyColour2/y").set(skyColourTwo.y);
  firebase.database().ref("bubbles/" + roomName + "/data/skyColour2/z").set(skyColourTwo.z);
  firebase.database().ref("bubbles/" + roomName + "/data/landColour1/x").set(landColourOne.x);
  firebase.database().ref("bubbles/" + roomName + "/data/landColour1/y").set(landColourOne.y);
  firebase.database().ref("bubbles/" + roomName + "/data/landColour1/z").set(landColourOne.z);
  firebase.database().ref("bubbles/" + roomName + "/data/landColour2/x").set(landColourTwo.x);
  firebase.database().ref("bubbles/" + roomName + "/data/landColour2/y").set(landColourTwo.y);
  firebase.database().ref("bubbles/" + roomName + "/data/landColour2/z").set(landColourTwo.z);
}

function setSkyColours(colour1In, colour2In)
{
  skyUniforms = {
		colour1: { type: "v3", value: colour1In },
		colour2: { type: "v3", value: colour2In }
	};
	skyMaterial = new THREE.ShaderMaterial( {
		uniforms: skyUniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});

  skyMesh.material = skyMaterial;
}

function setLandColours(colour1In, colour2In)
{
  landUniforms = {
		colour1: { type: "v3", value: colour1In },
		colour2: { type: "v3", value: colour2In }
	};
	landMaterial = new THREE.ShaderMaterial( {
		uniforms: landUniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});

  globe.material = landMaterial;
}

function animate()
{
	var time = performance.now() / 1000;

	globe.rotation.z = time / 10;
	skyMesh.rotation.z = time / 10;

  for (var object = 0; object < objects.length; object++)
  {
    objects[object].rotation.y = time / 5;
  }

	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

requestAnimationFrame( animate );

const API_KEY = 'AIzaSyC7jx-vbuQj5CmfnD_jYSyfYnpK9r6QJqo';

function setBubbleObject(rotation, id, colour1In, colour2In)
{
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/rotation").set(rotation);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/id").set(id);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/colour1/x").set(colour1In.x);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/colour1/y").set(colour1In.y);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/colour1/z").set(colour1In.z);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/colour2/x").set(colour2In.x);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/colour2/y").set(colour2In.y);
  firebase.database().ref("bubbles/" + roomName + "/data/objects/" + (objects.length - 1).toString() + "/colour2/z").set(colour2In.z);
}

function loadBubbleObject(rotation, id, colour1In, colour2In)
{
  var url = `https://poly.googleapis.com/v1/assets/${id}/?key=${API_KEY}`;

  var request = new XMLHttpRequest();
  request.open( 'GET', url, true );
  request.addEventListener( 'load', function ( event )
  {
    var asset = JSON.parse( event.target.response );

    var format = asset.formats.find( format => { return format.formatType === 'OBJ'; } );

    if (format !== undefined)
    {
      var obj = format.root;
      var mtl = format.resources.find( resource => { return resource.url.endsWith( 'mtl' ) } );

      var path = obj.url.slice( 0, obj.url.indexOf(obj.relativePath));

      var loader = new THREE.MTLLoader();
      loader.setCrossOrigin( true );
      loader.setTexturePath( path );
      loader.load( mtl.url, function (materials)
      {
        var loader = new THREE.OBJLoader();
        loader.setMaterials( materials );
        loader.load( obj.url, function (object)
        {
          var box = new THREE.Box3();
          box.setFromObject( object );

          // re-center
          var center = box.getCenter();
          center.y = box.min.y;
          object.position.sub( center );

          object.traverse(function (child)
          {
              objectUniforms = {
                colour1: { type: "v3", value: inhabitantColourOne },
                colour2: { type: "v3", value: inhabitantColourTwo }
              };
              objectMaterial = new THREE.ShaderMaterial( {
                uniforms: objectUniforms,
                vertexShader: document.getElementById( 'vertexShader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentShader' ).textContent
              });

              child.material = objectMaterial;
          });

          // scale
          var scaler = new THREE.Group();
          scaler.position.set(0, 0.49, 0);
          scaler.add(object);
          scaler.scale.setScalar(1 / box.getSize().length() * 0.2);

          var pivot = new THREE.Group();
          pivot.rotation.z = rotation;
          globe.add(pivot);
          pivot.add(scaler);

          objects.push(scaler);
        });
      });
    }
  });
  request.send( null );
}

function searchPoly()
{
  var url = `https://poly.googleapis.com/v1/assets?keywords=${query.value}&format=OBJ&key=${API_KEY}&maxComplexity=SIMPLE`;

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.addEventListener( 'load', function (event)
  {
    onResults(JSON.parse(event.target.response));
  });

  request.send(null);
}

function onResults(data)
{
  while (results.childNodes.length)
  {
    results.removeChild(results.firstChild);
  }

  var assets = data.assets;

  if (assets)
  {
    for (var i = 0; i < assets.length; i++)
    {
      var asset = assets[i];

      if (asset.authorName == "Poly by Google")
      {
        var image = createImage(asset);
        results.appendChild(image);
      }
    }
  }
  else
  {
    results.innerHTML = '<center>NO RESULTS</center>';
  }
}

function createImage(asset)
{
  var image = document.createElement('img');
  image.src = asset.thumbnail.url;
  image.style.width = '100px';
  image.style.height = '75px';

  var format = asset.formats.find(format => { return format.formatType === 'OBJ'; });

  if (format !== undefined)
  {
    image.onclick = function ()
    {
      selectedAsset = asset;
      selectedFormat = format;
    }
  }

  return image;
}

function addObject(x, y, z)
{
  var obj = selectedFormat.root;
  var mtl = selectedFormat.resources.find(resource => { return resource.url.endsWith('mtl') });

  var path = obj.url.slice(0, obj.url.indexOf(obj.relativePath));

  var loader = new THREE.MTLLoader();
  loader.setCrossOrigin(true);
  loader.setTexturePath(path);
  loader.load(mtl.url, function (materials)
  {
    var loader = new THREE.OBJLoader();
    loader.setMaterials( materials );

    loader.load( obj.url, function(object)
    {
      var box = new THREE.Box3();
      box.setFromObject(object);

      // re-center
      var center = box.getCenter();
      center.y = box.min.y;
      object.position.sub(center);

      object.traverse(function (child)
      {
        if (child instanceof THREE.Mesh)
        {
            objectUniforms = {
              colour1: { type: "v3", value: inhabitantColourOne },
              colour2: { type: "v3", value: inhabitantColourTwo }
            };
            objectMaterial = new THREE.ShaderMaterial( {
              uniforms: objectUniforms,
              vertexShader: document.getElementById( 'vertexShader' ).textContent,
              fragmentShader: document.getElementById( 'fragmentShader' ).textContent
            });

            child.material = objectMaterial;
        }
      });

      // scale
      var scaler = new THREE.Group();
      scaler.position.set(0, 0.49, 0);
      scaler.add(object);
      scaler.scale.setScalar(1 / box.getSize().length() * 0.2);

      var pivot = new THREE.Group();
      pivot.rotation.z = -globe.rotation.z;
      globe.add(pivot);
      pivot.add(scaler);

      objects.push(scaler);

      setBubbleObject(-globe.rotation.z, selectedAsset.name.replace("assets/", ""), inhabitantColourOne, inhabitantColourTwo);
    });
  });
}

function onMouseDown(e)
{
  e.preventDefault();

  var origin = new THREE.Vector3();
  origin.x = -((event.clientX - viewer.offsetLeft) / WIDTH) + 0.5;
  origin.y = -((event.clientY - viewer.offsetTop) / WIDTH) + 0.5;
  origin.z = 0;
  addObject(origin.x, origin.y, origin.z);
}
