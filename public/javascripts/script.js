var map,marker,geocoder;
var productIndex=0;
function initialize() {
      var myOptions = {
          //center: new google.maps.LatLng(-34.397, 150.644),
          center: new google.maps.LatLng(-4.5, 15.5),      
          zoom: 6,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      
      map = new google.maps.Map(document.getElementById('map_canvas'),
        myOptions);
    
       marker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        title: 'Click to zoom'
      });
      
      geocoder = new google.maps.Geocoder();
    
      google.maps.event.addListener(marker, 'click', function() {
        map.setZoom(6);
        map.setCenter(marker.getPosition());
      });
      
      google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
      });
      
       google.maps.event.addListener(map, 'dblclick', function(event) {
          var ptitle = prompt("Please give product title:","Prod"+productIndex++);
          var loc = [Math.round(event.latLng.lng()*1000)/1000,Math.round(event.latLng.lat()*1000)/1000];
          //[event.latLng.lat()*1000,event.latLng.lng()]
           $.post( 'newproduct',{title:ptitle,location:loc} , function(data, textStatus, jqXHR){
            console.log("newproduct",data,textStatus,jqXHR);         
        } );
      });
      
      google.maps.event.addListener(map, 'center_changed', function() {
        /*// 3 seconds after the center of the map has changed, pan back to the
        // marker.
        window.setTimeout(function() {
          map.panTo(marker.getPosition());
        }, 3000);*/
      });
   // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);
        map.setCenter(pos);
        placeMarker(pos);
      }, function(err) {
        console.log(" GeoLocation Error",err);
        handleNoGeolocation(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
 }

  function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
          var content = 'Error: The Geolocation service failed.';
        } else {
          var content = 'Error: Your browser doesn\'t support geolocation.';
        }
    
        var options = {
          map: map,
          position: new google.maps.LatLng(60, 105),
          content: content
        };
    
        var infowindow = new google.maps.InfoWindow(options);
        map.setCenter(options.position);

  }



 function placeMarker(location) {
  marker.setPosition(location);    
  map.setCenter(location);
  geocoder.geocode({'latLng': location}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          //map.setZoom(6)
          //$(".result").html("Your click position is (Lat/Long) : <b>"+location.lat()+" / "+location.lng()+".</b> ("+results[1].formatted_address+")");
          $(".result").html("Near Lng/Lat »: <b>"+results[1].formatted_address+".</b> ("
                  +Math.round(location.lng()*1000)/1000+" / "+Math.round(location.lat()*1000)/1000+")");
          fetchProducts([location.lng(),location.lat()]);
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    }); 
 
 function fetchProducts(loc){
     var url = '/storelocation';
     $.post( url,{location:loc} , function(data, textStatus, jqXHR){
         console.log("Data",data,textStatus,jqXHR);
         $(".product-result").html(data);
     } );
 }



WebFontConfig = {
        google: { families: [ 'Tangerine', 'Cantarell' ] }
      };
 }