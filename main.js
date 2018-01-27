const WIDTH = viewer.offsetWidth;
const HEIGHT = viewer.offsetHeight;

var camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, 0, 100);
camera.position.set( 0, 100, 0 );
camera.lookAt( 0, 0, 0 );

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x222222 );

var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
light.position.set( 0, 0, 0 );
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( WIDTH, WIDTH );
viewer.appendChild( renderer.domElement );

var geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var globe = new THREE.Mesh( geometry, material );
globe.position.set(0, 0, 0.5);
scene.add( globe );

var selectedAsset;
var selectedFormat;

function init()
{

}

function animate()
{
	var time = performance.now() / 1000;

	globe.rotation.y = time / 10;

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
