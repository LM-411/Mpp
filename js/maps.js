function Map()
{
	
}

/**
 * Display the map showing the user position or the latter and the other position
 */
Map.displayMap = function(userPosition, carPosition)
{
   var userLatLng = null;
   var carLatLng = null;
 
   if (userPosition != null)
      userLatLng = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
   if (carPosition != null)
      carLatLng = new google.maps.LatLng(carPosition.position.latitude, carPosition.position.longitude);
 
   var options = {
      zoom: 5,
      disableDefaultUI: true,
      streetViewControl: true,
      center: userLatLng,
      mapTypeId: google.maps.MapTypeId.TERRAIN
   }
 
   var map = new google.maps.Map(document.getElementById('map'), options);
   var marker = new google.maps.Marker({
      position: userLatLng,
      map: map,
      title: 'Your position'
   });
   // If carLatLng is null means that the function has been called when the
   // user set his current position and that is when he parked the car so the
   // icon will be shown accordingly.
   if (carLatLng == null)
      marker.setIcon('images/car-marker.png');
   else
      marker.setIcon('images/user-marker.png');
   var circle = new google.maps.Circle({
      center: userLatLng,
      radius: userPosition.coords.accuracy,
      map: map,
      fillColor: '#70E7FF',
      fillOpacity: 0.2,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0
   });
   map.fitBounds(circle.getBounds());
 
   if (carLatLng != null)
   {
      marker = new google.maps.Marker({
         position: carLatLng,
         map: map,
         icon: 'images/car-marker.png',
         title: 'Car position'
      });
      circle = new google.maps.Circle({
         center: carLatLng,
         radius: carPosition.position.accuracy,
         map: map,
         fillColor: '#70E7FF',
         fillOpacity: 0.2,
         strokeColor: '#0000FF',
         strokeOpacity: 1.0
      });
 
      // Display route to the car
      options = {
         suppressMarkers: true,
         map: map,
         preserveViewport: true
      }
      this.setRoute(new google.maps.DirectionsRenderer(options), userLatLng, carLatLng);
   }
 
   $.mobile.loading('hide');
}

/**
 * Calculate the route from the user to his car
 */
Map.setRoute = function(directionsDisplay, userLatLng, carLatLng)
{
   var directionsService = new google.maps.DirectionsService();
   var request = {
      origin: userLatLng,
      destination: carLatLng,
      travelMode: google.maps.DirectionsTravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC
   };
 
   directionsService.route(
      request,
      function(response, status)
      {
         if (status == google.maps.DirectionsStatus.OK)
            directionsDisplay.setDirections(response);
         else
         {
            navigator.notification.alert(
               'Unable to retrieve a route to your car. However, you can still find it by your own.',
               function(){},
               'Warning'
            );
         }
      }
   );
}

/**
 * Request the address of the retrieved location
 */
 
Map.requestLocation = function(position)
{

   new google.maps.Geocoder().geocode(
      {
         'location': new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      function(results, status)
      {
         if (status == google.maps.GeocoderStatus.OK)
         {
            var positions = new Position();
            positions.updatePosition(0, positions.getPositions()[0].coords, results[0].formatted_address);
         }
      }
   );
}

function sendLocation(position)
{
   new google.maps.Geocoder().geocode(
      {
         'location': new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      function(results, status)
      {
         if (status == google.maps.GeocoderStatus.OK)
         {
           
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
};
      
      document.getElementById('content').innerHTML = "";
      $.get("http://www.theagency.co.ls/hacka/electric.php?type=HousePower&lat=" + position.coords.latitude + "&long=" + position.coords.longitude, function (result) {
      
      var original = document.getElementById('content').innerHTML;
      $("div#content").html(original + "<div style='background:#fff;color:#333;padding:1em 0.3em 1em 0.3em;margin-bottom:1em'>" + result + "</div>");

      });
         
      }
   );
}

$('#map-page').live(
   'pageshow',
   function()
   {

      var requestType = urlParam('requestType');
      var positionIndex = urlParam('index');

      var geolocationOptions = {
         timeout: 15 * 1000, // 15 seconds
         maximumAge: 10 * 1000, // 10 seconds
         enableHighAccuracy: true
      };


      var position = new Position();
      
      $.mobile.loading('show');
      // If the parameter requestType is 'set', the user wants to set
      // his car position else he want to retrieve the position
      if (requestType == 'set')
      {
         navigator.geolocation.getCurrentPosition(
            function(location)
            {
               // setup some local variables


       
               // Save the position in the history log
               position.savePosition(
                  new Coords(
                     location.coords.latitude,
                     location.coords.longitude,
                     location.coords.accuracy
                  )
               );

               // Update the saved position to set the address name
               Map.requestLocation(location);
               Map.displayMap(location, null);
               navigator.notification.alert(
                  'Your position has been saved',
                  function(){},
                  'Info'
               );

            },
            function(error)
            {
               navigator.notification.alert(
                  'Unable to retrieve your position. Is your GPS enabled?',
                  function(){
                     alert("Unable to retrieve the position: " + error.message);
                  },
                  'Error'
               );
               $.mobile.changePage('index.html');
            },
            geolocationOptions
         );
      }
      else
      {
         if (position.getPositions().length == 0)
         {
            navigator.notification.alert(
               'You have not set a position',
               function(){},
               'Error'
            );
            $.mobile.changePage('index.html');
            return false;
         }
         else
         {
            navigator.geolocation.watchPosition(
               function(location)
               {
                  
                  // If positionIndex parameter isn't set, the user wants to retrieve
                  // the last saved position. Otherwise he accessed the map page
                  // from the history page, so he wants to see an old position

                   if (positionIndex == undefined)
                     Map.displayMap(location, position.getPositions()[0]);
                  else
                     Map.displayMap(location, position.getPositions()[positionIndex]);
               },
               function(error)
               {
                  console.log("Unable to retrieve the position: " + error.message);
               },
               geolocationOptions
            );
         }
      }
   }
);

$('#electric-page2').live(
   'pageshow',
   function()
   {

      var requestType = urlParam('requestType');
      

      var geolocationOptions = {
         timeout: 15 * 1000, // 15 seconds
         maximumAge: 10 * 1000, // 10 seconds
         enableHighAccuracy: true
      };


      var position = new Position();
      
      $.mobile.loading('show');
      // If the parameter requestType is 'set', the user wants to set
      // his car position else he want to retrieve the position
      if (requestType = 'HousePower')
      {
         navigator.geolocation.getCurrentPosition(
            function(location)
            {
     

               // Save the position in the history log
               position.savePosition(
                  new Coords(
                     location.coords.latitude,
                     location.coords.longitude,
                     location.coords.accuracy
                  )
               );

               // Update the saved position to set the address name
               Map.requestLocation(location);
               sendLocation(location);
               Map.displayMap(location, null);
               navigator.notification.alert(
                  'Your position has been saved and sent. Please be patient',
                  function(){},
                  'Info'
               );

            },
            function(error)
            {
               navigator.notification.alert(
                  'Unable to retrieve your position. Is your GPS enabled?',
                  function(){
                     alert("Unable to retrieve the position: " + error.message);
                  },
                  'Error'
               );
               $.mobile.changePage('index.html');
            },
            geolocationOptions
         );
      }
      else
      {
         if (position.getPositions().length == 0)
         {
            navigator.notification.alert(
               'You have not set a position',
               function(){},
               'Error'
            );
            $.mobile.changePage('index.html');
            return false;
         }
         else
         {
            navigator.geolocation.watchPosition(
               function(location)
               {
                  // If positionIndex parameter isn't set, the user wants to retrieve
                  // the last saved position. Otherwise he accessed the map page
                  // from the history page, so he wants to see an old position
                  if (positionIndex == undefined)
                     Map.displayMap(location, position.getPositions()[0]);
                  else
                     Map.displayMap(location, position.getPositions()[positionIndex]);
               },
               function(error)
               {
                  console.log("Unable to retrieve the position: " + error.message);
               },
               geolocationOptions
            );
         }
      }
   }
);

$('#welcome-page').live(
   'pageshow',
   function()
   {

      var requestType = urlParam('requestType');
 

      
      
      
      // If the parameter requestType is 'set', the user wants to set
      // his car position else he want to retrieve the position
      if (requestType == "%22")
      {

         window.setInterval(function()
         {

         // poll
         $.get("http://www.theagency.co.ls/hacka/poll.php?type=all", function (result) {
      
         var original = document.getElementById('electrical').innerHTML;
         if (result>0)
         {
            $("a#electrical").html("Electrical <a href='map.html?requestType=get' style='color:#fff;background:red;padding:0.3em;border-radius:25%'>" + result + "</a>");
         }
         });
      }, 5000
         );
      }
   }
);