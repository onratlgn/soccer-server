var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://flutter:dart@soccerdata-aslwr.gcp.mongodb.net/?retryWrites=true";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;

  var DB = db.db("devices");

});


function saveToMongo(dbase,coll,obj){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var DB = db.db(dbase);

    DB.collection(coll).insertOne(obj,function(err,res){
      if (err) throw err;
    })
  })
};

function deviceOn(id){
  MongoClient.connect(url,function(err,db){
      if(err) throw err;

      var coll = db.db("soccer").collection("users")

      coll.updateOne(
          {"devices.devID": id},
          {$set : {"devices.$[elem].status" : true}},
          {
              arrayFilters: [{"elem.devID" : id}],
              //upsert: true,
          }
      )
  })
}

function deviceOff(id){
  MongoClient.connect(url,function(err,db){
      if(err) throw err;

      var coll = db.db("soccer").collection("users")

      coll.updateOne(
          {"devices.devID": id},
          {$set : {"devices.$[elem].status" : false}},
          {
              arrayFilters: [{"elem.devID" : id}],
              //upsert: true,
          }
      )
  })
}

/*
exports.save = function(dbase,coll,obj){
  saveToMongo(dbase,coll,obj);
}

exports.devOn  = function(id){deviceOn(id);}
exports.devOff = function(id){deviceOff(id);}
*/

module.exports = {
  save  : (dbase,coll,obj)=>saveToMongo(dbase,coll,obj),
  devOn : (id)=>deviceOn(id),
  devOff: (id)=>deviceOff(id),
}