let map;
let infoWindow;
let locations = [
  {
    title: "Ellen's Stardust Diner",
    location: {
      lat:40.761863,
      lng:-73.9857387
    }
  },  {
    title: 'Park Avenue Tavern',
    location: {
      lat: 40.7502786,
      lng: -73.9808654
    }
  }, {
    title: 'Gansevoort Park Avenue NYC',
    location: {
      lat: 40.7438815,
      lng: -73.9862687
    }
  }, {
    title: 'Union Square Park',
    location: {
      lat: 40.7362553,
      lng: -73.9924972
    }
  }, {
    title: 'Whole Foods Market',
    location: {
      lat: 40.73649,
      lng: -73.988175
    }
  }, {
    title: 'Nanoosh',
    location: {
      lat: 40.7342423,
      lng: -73.9943599
    }
  }
];
// Google's function for initializing the map.
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 40.7413549,
      lng: -73.9980244
    },
    zoom: 13,
    mapTypeControl: false
  });

  let largeInfowindow = new google.maps.InfoWindow();
  infoWindow = new google.maps.InfoWindow();
  let bounds = new google.maps.LatLngBounds();
  // The following group uses the location array to create an array of markers on initialize.
  for (let i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    let position = locations[i].location;
    let title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id:i
    });
    //Marker gets to be visible by default
    marker.setVisible(true);
    // markers.push(marker);
    vm.locationsList()[i].marker = marker;
    // Create an onclick event to open the large infowindow at each marker and change the animation
    bounds.extend(marker.position);

    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
      animateUponClick(this);
    });

  }
  map.fitBounds(bounds);
} // end InitMap

// Adds two bounces after clicking. = could be moved into separate function
// This is being called on line 87 within the loop for marker creation
function animateUponClick(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
  }, 1460);
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
// Sample used and modified from the Udacity lectures
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time
    // to load.
    infowindow.setContent('');
    infowindow.marker = marker;

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was  found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        // infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
      }
    }
  // Wikipedia API Ajax request - sampled from udacity lecture, need to add additional msg if there are no relevant wiki links to selected place.

    let wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    $.ajax(wikiURL,{
      dataType: "jsonp",
      data: {
        async: true
      }
    }).done(function(response) {
      let articleStr = response[1];
      let URL = 'http://en.wikipedia.org/wiki/' + articleStr;
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      infowindow.setContent('<div>' +
        '<h3>' + marker.title + '</h3>' + '</div><br><a href ="' + URL + '">' + URL + '</a><hr><div id="pano"></div>');
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }).fail(function(jqXHR, textStatus) {
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      infowindow.setContent('<div>' +
        '<h3>' + marker.title + '</h3>' + '</div><br><p>Sorry. We could not contact Wikipedia! </p><hr><div id="pano"></div>');
        infowindow.open(map, marker);
    });

  };

} //end populateInfoWindow
var googleError = function() {
  alert('Sorry! Try again later!');
};
