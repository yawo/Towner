var map,marker,geocoder;
var productIndex=0;
var allProducts = [];
var newProductvalidator;
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
          //var ptitle = prompt("Please give product title:","Prod"+productIndex++);
          //var loc = [Math.round(event.latLng.lng()*1000)/1000,Math.round(event.latLng.lat()*1000)/1000];
          //[event.latLng.lat()*1000,event.latLng.lng()]
          createProductAt(event.latLng);         
           map.setZoom(6);
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
          var content = 'The Geolocation service failed. Please browse map to your position';
        } else {
          var content = 'Error: Your browser doesn\'t support geolocation.';
        }
    
        var options = {
          map: map,
          position: new google.maps.LatLng(-4.5, 15.5),
          content: content
        };
    
        var infowindow = new google.maps.InfoWindow(options);
        map.setCenter(options.position);

  }



 function placeMarker(location) {
  marker.setPosition(location);    
  //map.setCenter(location);
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
 }
 
 function fetchProducts(loc){
     var loc = loc || [marker.getPosition().lng(),marker.getPosition().lat()]
         ,category = $('#category-filter').val(), keywords = $('#content-filter').val();
     var url = '/storelocation',reg = new RegExp("[ ,;\+]+", "g");
     var kw  = (keywords?keywords.split(reg):[]);     
     $(".product-result").html("<p class='loading'>&nbsp;&nbsp;&nbsp;&nbsp;</p>");
     $.post(url,{location:loc,category:category,keywords:kw} , function(data, textStatus, jqXHR){
        //console.log("Data",data,textStatus);         
        $(".product-result").html("");    
        var content="<table width='100%'>";
        for(var i=0;i<data.products.length;i++){             
             content+="<tr class='product-item' onclick='productDetails("+i+")' onmouseout='productDetailsClear("+i+")' ondblclick='productEdit("+i+")' id='"+data.products[i]._id+"'>";
             content+="<td width='85%'><b>"+data.products[i].title+"</td>";             
             content+="</td><td> <i class='action-edit' title='Edit the product'    onclick='productEdit("+i+")'/> ";             
             content+=" <i class='action-remove' title='Delete the product' onclick='productRemove("+i+")'/> ";
             content+="</td></tr>";
        }
        content+="</table>";
        $(".product-result").append(content);        
        $( ".action-remove" ).button({text: false,icons: {primary: "ui-icon-closethick"}});
        $( ".action-edit" ).button({text: false,icons: {primary: "ui-icon-pencil"}});
        $( ".action-like" ).button({text: false,icons: {primary: "ui-icon-check"}});
        $( ".action-mark" ).button({text: false,icons: {primary: "ui-icon-comment"}});
        $( ".action-erronous" ).button({text: false,icons: {primary: "ui-icon-cancel"}});
        $( ".product-result tr:odd" ).addClass("odd-tr");
        allProducts = data.products;
     });
 }

 function productRemove(i){
     if (confirm("Sure you wanna delete it?")){
         var url = '/deleteproduct';
         $.post( url,{_id:allProducts[i]._id});
         $("#"+allProducts[i].id).remove();
     }
 }
 
 
 function productEdit(i){     
    //Fill all values    
    $.colorbox({inline:true,href:"#dialog-form",opacity:0.7});          
    newProductvalidator.resetForm();
    for(var field in allProducts[i]){
        $("#newproductform #"+field).val(allProducts[i][field]);           
    }
 }
 
 function productDetails(i){         
    $("#"+allProducts[i]._id).addClass('ui-state-hover');   
    var content = "<div class='product-details ui-corner-all'>";
    content+=allProducts[i].title+"<br/>"+allProducts[i].description;
    content+="</div>";
    console.log(content);
    $('#towner-main').append(content);    
 }
 
 
 function productDetailsClear(i){     
     $("#"+allProducts[i]._id).removeClass('ui-state-hover');
    $(".product-details").remove();
 }
 
 function productScore(i,type){     
     //type: -1=dislike, -2=erronous, 1=like, 
 }
 
 function newProductInit() {        
        newProductvalidator = $("#newproductform").validate();         
        $( ".dlt-datepicker" ).datepicker();
        $("#new-product-submit").button().click(function(){
            
            if(newProductvalidator.form()){                
            	$("#newproductform").ajaxSubmit({success:function(data){
                    //console.log(data);
                }});                
                newProductvalidator.resetForm();
                $.colorbox.close();
            }
        });
        $("#new-product-cancel").button().click(function(){
            newProductvalidator.resetForm();
        });
 }
 
 function createProductAt(loc){
    $("#newproductform #locationLng").val(loc.lng());
    $("#newproductform #locationLat").val(loc.lat());          
    geocoder.geocode({'latLng': loc}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
            $("#newproductform #locationStr").val(results[1].formatted_address);
        }
      } else {
        console.log("Geocoder failed due to: " + status);
      }
    });     
    $.colorbox({inline:true,href:"#dialog-form",opacity:0.7});      
 }
 
