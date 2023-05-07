const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Danusshkumar-admin:TestPassword@cluster0.s4p8wek.mongodb.net/todoListDB");

//mongoose.connect("mongodb://localhost:27017");

const items = ["Buy Food", "Cook Food", "Eat Food"];

//creating schema

const itemSchema = mongoose.Schema({
  name : String
});

const listSchema = mongoose.Schema({
  name : String,
  items : [itemSchema]
});

//models(collections) are declared here

const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Item({name : "Welcome to your Todolist!"});
const item2 = new Item({name : "Hit the + button to add a new item"});
const item3 = new Item({name : "<-- Hit this to delete an item"});

// rendering the main page

app.get("/", async function(req, res) {

  const queryResult = await Item.find({});

  if(queryResult.length === 0){
    Item.insertMany([item1,item2,item3]);
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", listItems: queryResult});
  }


});

//adding new element into items and customLists

app.post("/", async function(req, res){

  const newItemName = req.body.newItem;
  const listName = req.body.listName;

  if(listName === "Today"){

    const newItem = new Item({
      name : newItemName
    }); 
    await newItem.save();

    res.redirect("/");
    
  }
  else{

    const customList = await List.findOne({name : listName});

    customList.items.push({ name : newItemName });

    await customList.save();

    res.redirect("/"+listName);

  }

  
});

//deleting elements from items and customLists

app.post("/delete",async (req,res) => {
  const listName = req.body.listName;
  const checkedItemId = req.body.checkBox;

  if(listName === "Today"){
    await Item.findOneAndDelete({_id : checkedItemId});
    res.redirect("/");
  }
  else {
    await List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}});
    // inside the List collection
    // inside the entry with name list
    // inside the list items
    // using $pull (comes with mongodb) that only works for lists
    // to remove the item with id 'checkedItemId'
    res.redirect("/" + listName);

  }

});

//creating custom list using express

app.get("/:customListName",async (req,res) => {

  //creating custom list in the database if it doesn't exists

  const listName = lodash.capitalize(req.params.customListName);

  let customList = await List.findOne({name : listName});

  if(!customList){
    customList = new List({
      name : listName,
      items : [item1,item2,item3]
    });

    customList.save();
  }

  res.render("list", {listTitle: listName, listItems: customList.items});
});

//about page routing

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

