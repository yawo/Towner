var map,marker,geocoder;
var productIndex=0;
var allProducts = [];
var newProductvalidator;
var colorBoxOptions = {inline:true,href:"#dialog-form",opacity:0.4,top:135,left:300};
var serverUrl = 'http://googlemaps.mcguy.c9.io';
//This is the compilation of partials/product.jade template
var productDetailsTemplate = '<div class="product-details ui-corner-all"><b id="product-details-title"></b>(<small>press <b>Esc</b> to close</small>)<br/><div id="product-details-description"></div></div>';
var zoom=5;
var isAuthenticated=false;
var enums = {
    scores:{mark:2,like:1,unlike:-1,erronous:-2}
};
function setAuthenticated(auth){
    isAuthenticated=auth;    
    console.log("auth?",auth);
}
function initialize() {
      var myOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          //center: new google.maps.LatLng(-4.5, 15.5),      
          zoom: zoom,
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
        //map.setZoom(zoom);
        //map.setCenter(marker.getPosition());
      });
      
      google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
      });
      
       google.maps.event.addListener(map, 'dblclick', function(event) {
          //var ptitle = prompt("Please give product title:","Prod"+productIndex++);
          //var loc = [Math.round(event.latLng.lng()*1000)/1000,Math.round(event.latLng.lat()*1000)/1000];
          //[event.latLng.lat()*1000,event.latLng.lng()]
          createProductAt(event.latLng);         
           //map.setZoom(zoom);
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
          var content = 'Geolocation service failed. Please browse map to your position';
        } else {
          var content = 'Error: Your browser doesn\'t support geolocation.';
        }
    
        var options = {
          map: map,
          position: new google.maps.LatLng(-34.397, 150.644),
          content: content
        };
    
        var infowindow = new google.maps.InfoWindow(options);
        map.setCenter(options.position);
        map.setZoom(zoom);

  }



 function placeMarker(location) {
  marker.setPosition(location);    
  //map.setCenter(location);
  geocoder.geocode({'latLng': location}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) { 
          //map.setZoom(zoom)
          //$(".result").html("Your click position is (Lat/Long) : <b>"+location.lat()+" / "+location.lng()+".</b> ("+results[1].formatted_address+")");
          $(".result").html("<small>Near  » <b>"+results[1].formatted_address+".</b> (lng:"
                  +Math.round(location.lng()*100)/100+", lat:"+Math.round(location.lat()*100)/100+")<small>");
             
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
             content+="<tr class='product-item'  onmouseoutNO='productDetailsClear("+i+")' ondblclick='productEdit("+i+")' id='"+data.products[i]._id+"'>";
             content+="<td width='85%' onclick='productDetails("+i+")'><b>"+data.products[i].title+"</td>";             
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
     if(!isAuthenticated){
         $.colorbox({html:"Please <b>Login</b> (<small>at the top right</small>) before."});
         console.log("Not Auth");
         return;
     }
     if (confirm("Sure you wanna delete it?")){
         var url = '/deleteproduct';
         $.post( url,{_id:allProducts[i]._id});
         $("#"+allProducts[i].id).remove();
     }
 }
 
 
 function productEdit(i){     
     if(!isAuthenticated){
         $.colorbox({html:"Please <b>Login</b> (<small>at the top right</small>) before."});
         return;
     }
    //Fill all values    
    $.colorbox(colorBoxOptions);          
    newProductvalidator.resetForm();
    for(var field in allProducts[i]){
        $("#newproductform #"+field).val(allProducts[i][field]);           
    }
 }
 
 function productDetails(i){         
    $(".product-item").removeClass('ui-state-hover'); 
    $(".product-details").remove();
    $("#"+allProducts[i]._id).addClass('ui-state-hover');           
    $('#towner-main').append(productDetailsTemplate);  
    //Fill values
    for(var field in allProducts[i]){
        $("#product-details-"+field).html(allProducts[i][field] || 'n/a');           
    }    
 } 
 
 
 function productDetailsClear(i){     
     $("#"+allProducts[i]._id).removeClass('ui-state-hover');
    $(".product-details").remove();
 }
 
 function productScore(type,val){     
     //type: -1=dislike, -2=erronous, 1=like,2=mark 
     if(!isAuthenticated){
         $.colorbox({html:"Please <b>Login</b> (<small>at the top right</small>) before."});
         return;
     }else{         
         switch(type){
            case enums.scores.mark:
                 break;
            case enums.scores.like:
                 break;
            case enums.scores.unlike:
                 break;
            case enums.scores.erronous:
                 break;     
         }
    }
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
    if(!isAuthenticated){
         $.colorbox({html:"Please <b>Login</b> (<small>at the top right</small>) before."});
         return;
     } 
    var loc = loc || marker.getPosition();
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
    $.colorbox(colorBoxOptions);      
 }
 /******* Socket.io ***************/
    //var socket = io.connect(serverUrl);
    /* socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
    });*/
    
    var channel1 = io.connect(serverUrl+'/channel1?token=aXoqIwP');
    channel1.on('news', function (data) {
        console.log(data);
        channel1.emit('my other event', { my: 'data' });
    });
    
    var channel2 = io.connect(serverUrl+'/channel2?token=aXoqIwP');
    channel2.on('news', function (data) {
        console.log(data);
        channel2.emit('my other event', { my: 'data' });
    });