// *******************************************************
// expressjs template
//
// assumes: npm install express
// defaults to jade engine, install others as needed
//
// assumes these subfolders:
//   public/
//   public/javascripts/
//   public/stylesheets/
//   views/
//
var express = require('express');
//var app = module.exports = express.createServer();
var app = express.createServer();
var viewEngine = 'jade'; // modify for your view engine

var MONGO_URL = "mongodb://root:root@ds033047.mongolab.com:33047/product";
// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', viewEngine);
  app.set('view options', {layout:true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());  
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ secret: "keyboard cat" }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});
/************* Routes *****************************************/

app.get('/', function(req, res){
    res.render('maps');
    //res.send("Hello");
});

app.post('/storelocation', function(req, res){
  // Perhaps we posted several items with a form
  // (use the bodyParser() middleware for this)  
  req.session.location = req.body.location;  
  Product.find().near('location',req.session.location).exec(function(err, docs){
        var locProducts = {};
        if(err){
             console.log("findProductNear Error:",err);             
        }else{            
            console.log("findProductNear (loc,docs): ",req.session.location,docs.length,"Items");
            locProducts = docs;
        }
        res.json({products:locProducts});
    });   
});

/********** Connection à MongoDB ******/
console.time("MongoDb init");
var mongoose = require('mongoose');
mongoose.connect(MONGO_URL);
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var ProductSchema = new Schema({
    code        : ObjectId
  , title       : String
  , price       : String
  , isAvalaible : Boolean
  , onlineDate  : Date
  , owner       : String
  , location    : [Number]
});
ProductSchema.index({location:"2d",title:1});


var Product = mongoose.model('Product',ProductSchema);

//Insert products
var products = [];
 products[0] = new Product({ 
     title       : 'P1'
  , price       : '50'
  , isAvalaible : true
  , onlineDate  : new Date()
  , owner       : 'Mohafada'
  , location    : [10,10]});
 
 products[1] = new Product({ 
     title       : 'P2'
  , price       : '50'
  , isAvalaible : true
  , onlineDate  : new Date()
  , owner       : 'FisdeLom'
  , location    : [150,10]});
 
 products[2] = new Product({ 
     title       : 'P3'
  , price       : '50'
  , isAvalaible : true
  , onlineDate  : new Date()
  , owner       : 'GuiLeBon'
  , location    : [150,150]});
  
 products[3] = new Product({ 
     title       : 'P4'
  , price       : '50'
  , isAvalaible : true
  , onlineDate  : new Date()
  , owner       : 'PlaizGo'
  , location    : [10,150]});
  
  products.forEach(function(prod){
      prod.save(function(err){
          if(err){
            console.log(prod.title,"Error saving:",err);
          } 
      });
  });  
  console.timeEnd("MongoDb init");
  
 

/*** Launch the server on env port or use 3000 by default ****/
app.listen(process.env.PORT || process.env['app_port'] || 3000);

function findProductNear(loc){
    var docs={};
    Product.find().where('location').near(loc).exec(getRes);    
    function getRes(err, res){
        if(err){
             console.log("findProductNear Error:",err);
             return '{}';
        }else{            
            //console.log("findProductNear (loc,docs): ",loc,docs);
            docs = res;
        }
    }
    
    return docs;
}
