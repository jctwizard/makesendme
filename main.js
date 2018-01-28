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

function init()
{
  viewer.addEventListener('mousedown', onMouseDown, false);

  searchPoly();
}

function animate()
{
	var time = performance.now() / 1000;

	globe.rotation.z = time / 10;

	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

requestAnimationFrame( animate );

const API_KEY = 'AIzaSyC7jx-vbuQj5CmfnD_jYSyfYnpK9r6QJqo';

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

      // scale
      var scaler = new THREE.Group();
      scaler.position.set(0, 0.45, 0);
      scaler.add(object);
      scaler.scale.setScalar(1 / box.getSize().length() * 0.5);

      var pivot = new THREE.Group();
      pivot.rotation.z = -globe.rotation.z;
      globe.add(pivot);
      pivot.add(scaler);
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
