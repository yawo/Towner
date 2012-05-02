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


var MONGO_URL = "mongodb://root:root@ds033047.mongolab.com:33047/product";
// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout:false});
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
    res.render('maps',{productFields:[['category','select','Hospital',['Pharmacy','Hospital','Hotel','SuperMarket','Train-Airport','Religious','Club','Ministry','Company','Restaurant','Cinema','School-Faculty']]
                        ,['title','text'],['price','number',0],['isAvailable','checkbox',true]
                        ,['owner','text'],['description','textarea'],['offlineDate','date'],['picture','url']]
                    });
    //res.send("Hello");
});

app.post('/saveproduct', function(req, res){    
    var data =  {title:req.body.title
          ,category:req.body.category
          ,price:req.body.price
          ,description:req.body.description
          ,owner:req.body.owner
          ,picture:req.body.picture
          ,offlineDate:req.body.offlineDate
          ,isAvailable:req.body.isAvailable
          ,location:[req.body.locationLng,req.body.locationLat]
          ,locationStr:req.body.locationStr
          }; 
          
    if(req.body._id){
        data =  {title:req.body.title
          ,category:req.body.category
          ,price:req.body.price
          ,description:req.body.description
          ,owner:req.body.owner
          ,picture:req.body.picture
          ,offlineDate:req.body.offlineDate
          ,isAvailable:req.body.isAvailable          
          };
      var conditions = { _id:req.body._id }
      , options = { multi: true };    
        Product.update(conditions, data, options, function (err, numAffected) {
          if(err){
              console.log(req.body._id," update failed");
              res.json({status:'failure'});
              res.json({status:'success'});
          }
          console.log(req.body._id," updated (",numAffected," update(s) )");
        }); 
        
    }else{
        var prd = new Product(data);
        prd.save(function(err){
              if(err){
                console.log(prd.title,"Error saving:",err);
                res.json({status:'failure'});
              } else{
                  res.json({status:'success'});
                  console.log(req.body.title," created ");
              }   
        });
    }
});

app.post('/deleteproduct', function(req, res){
  Product.remove({_id:req.body._id},function(err){
          if(err){
            console.log(req.body._id,"Error deleting:",err);
            res.json({status:'failure'});
          } else{
              res.json({status:'success'});
          }
      });  
}); 

app.post('/storelocation', function(req, res){
  // Perhaps we posted several items with a form
  // (use the bodyParser() middleware for this)  
  req.session.location = req.body.location;  
  var sldocs ={};
  var slhandler = (function(scop){
      return function(err, docs){
        if(err){
             console.log("findProductNear Error:",err);             
        }else{            
            sldocs = docs;
        } 
        //res.partial('partials/product',locProducts);
        res.json({products:sldocs});
        console.log("findProductNear (loc,docs): ",req.session.location,sldocs.length,"Items"); 
      }
  })(sldocs);
  var filters = {category:req.body.category};
  if(req.body.keywords){
      var or = [];
      for(var i=0; i<req.body.keywords.length;i++){
          or[i]={ title : { $regex : new RegExp(req.body.keywords[i],'i') } };
      }
      filters = {category:req.body.category,$or:or};
  }
  console.log("filters",filters);
  Product.find(filters).near('location',req.session.location).limit(50).exec(slhandler);
  
});

/********** Connection à MongoDB ******/
console.time("MongoDb init");
var mongoose = require('mongoose');
mongoose.connect(MONGO_URL);
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

//We need a redis base to compute stats.

var ProductSchema = new Schema({
    id          : ObjectId
  , category    : String    
  , title       : String
  , description : String
  , price       : String
  , isAvailable : Boolean
  , onlineDate  : Date
  , offlineDate : Date
  , owner       : String
  , likes       : Number
  , mark        : Number
  , erronous    : [String]
  , picture     : String
  , locationStr : String
  , location    : [Number]
});
ProductSchema.index({location:"2d",category:1,title:1,description:1,isAvailable:1});


var Product = mongoose.model('Product',ProductSchema);

//Insert products
var products = [];
 products[0] = new Product({ 
    title       : 'P1'
  , price       : '50'
  , isAvailable : true
  , onlineDate  : new Date()
  , owner       : 'Mohafada'
  , location    : [10,10]});
 
 products[1] = new Product({ 
     title       : 'P2'
  , price       : '50'
  , isAvailable : true
  , onlineDate  : new Date()
  , owner       : 'FisdeLom'
  , location    : [150,10]});
 
 products[2] = new Product({ 
     title       : 'P3'
  , price       : '50'
  , isAvailable : true
  , onlineDate  : new Date()
  , owner       : 'GuiLeBon'
  , location    : [150,150]});
  
 products[3] = new Product({ 
     title       : 'P4'
  , price       : '50'
  , isAvailable : true
  , onlineDate  : new Date()
  , owner       : 'PlaizGo'
  , location    : [10,150]});
  
  /*products.forEach(function(prod){
      prod.save(function(err){
          if(err){
            console.log(prod.title,"Error saving:",err);
          } 
      });
  });  */
  console.timeEnd("MongoDb init");
  
 

/*** Launch the server on env port or use 3000 by default ****/
app.listen(process.env.PORT || process.env['app_port'] || 3000);

function findProductNear(loc){
      var data =  ['title'
          ,'category'
          ,'price'
          ,'description'
          ,'offlineDate'
          ,'likes'
          ,'mark'
          ,'erronous'
          ,'owner'
          ,'picture'
          ,'location'
          ,'locationSt'];
    var docs={};
    Product.find({},data).where('location').near(loc).exec(getRes);    
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
