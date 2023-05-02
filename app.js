//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://viniciusroque:test123@cluster0.bdkql0f.mongodb.net/todolistDB");




//Item test /////////////////////////
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const rice = new Item({
  name: "Rice"
});

const water = new Item({
  name: "Water"
});

const weed = new Item({
  name: "Weed"
});

const itemsArray = [rice, water, weed];


// List Test /////////////////////////////////////////
const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



//CRUD Test //////////////////////////////////////

app.get("/", function(req, res) {

  
  
  Item.find().then(function (itemsDB) {
    
    if (itemsDB.length === 0) {
      Item.insertMany(itemsArray).then(function () {
        console.log("Successfully saved defult items to DB");
        
      })
      .catch(function (err) {
        console.log(err);
      });
      
      res.redirect("/");

    } else {
      res.render("list", {listTitle: "Today", newListItems: itemsDB});
      };
      
    });

    
  
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  


  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function (foundList) {
      console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today" ) {
    Item.findByIdAndDelete(checkedItem).then(function () {
      console.log("Successfully saved defult items to DB");
      res.redirect("/");
    }).catch(function (err) {
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}).then(function () {
          res.redirect("/" + listName);
        
      })
    }
  });
   

// Dynamic List Test /////////////////////////

app.get("/:listName", function(req,res){

  const listSelect = _.capitalize(req.params.listName);

  List.findOne({name: listSelect}).then(function (foundList) {
    
    if (!foundList) {

      const list = new List({
        name: listSelect,
        items: itemsArray
      });

      list.save();

      res.redirect("/" + listSelect);
      
      

    } else {
      

      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
      
    });
});










app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000.");
  
});
