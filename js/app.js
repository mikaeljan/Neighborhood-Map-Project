var  Location = function(data) {
  this.title = data.title;
  this.location = data.location;

};

var  ViewModel = function() {
  var  self = this;

  self.locationsList = ko.observableArray([]);

  locations.forEach(function(location) {
    self.locationsList.push(new Location(location));
  });
  //Will show when Google Maps will be unavailable
  self.mapError = ko.observable(false);

  self.filter = ko.observable('');
  self.filteredLocations = ko.computed(function() {
    var  filterResult = self.filter().toLowerCase();

    if (!filterResult) {
      for (var i = 0; i < self.locationsList().length; i++) {
        //When this runs first time there are no markers yet,therefore checking
        // whether they defined, if yes set them visible so we are back to
        //square one
        if (self.locationsList()[i].marker) {
          self.locationsList()[i].marker.setVisible(true);
        }
      }//end for loop
      return self.locationsList();
    } else {
      return ko.utils.arrayFilter(self.locationsList(), function(loc) {
        // test to see if item matches filter and store results as a variable
        var  match = loc.title.toLowerCase().indexOf(filterResult) >= 0;
        // set marker visibility based on match status
        if (loc.marker) {
          loc.marker.setVisible(match);

        }
        // return match status to item in list view if match
        return match;
      });
    }
  }, self);

  self.clearFilter = function() {
    self.filter('');
    
    for (var i = 0; i < self.locationsList().length; i++) {
      //get all the markers back
      self.locationsList()[i].marker.setVisible(true);
    }
  };

  self.currentLocation = ko.observableArray([this.locationsList()[0]]);

  this.selectLocation = function(clickedLocation) {
    //sets the currentLoc to selected element from the list view
    self.currentLocation(clickedLocation);
    animateUponClick(clickedLocation.marker);
    //populating the info window by clicked marker from list
    populateInfoWindow(clickedLocation.marker, infoWindow);
  };
  //Observable for Menu | Navigation Bar Toggle Button
  self.visibleMenu = ko.observable(false),
  //Showing/Hiding the menu
  self.clickMe = function() {
    this.visibleMenu(!this.visibleMenu());
};

};

var  vm = new ViewModel();
ko.applyBindings(vm);
