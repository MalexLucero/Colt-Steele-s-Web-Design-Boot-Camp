var express     = require("express"),
app             = express(),
port            = 3000,
bodyParser      = require("body-parser"),
mongoose        = require("mongoose"),
Campground      = require("./models/campground"),
Comment         = require("./models/comment"),
seedDB          = require("./seed");

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp");
seedDB();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");



app.get("/", function(req, res){
    res.render("landing");
});

//INDEX ROUTE - SHOW ALL CAMPGROUNDS
app.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, campgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: campgrounds });
        }
    });
});
//CREATE ROUTE - ADDS NEW CAMPGROUND
app.post("/campgrounds", function(req, res){
    var name        = req.body.name,
    image           = req.body.image,
    description     = req.body.description,
    newCampground   = {name: name, image: image, description: description};
    

    Campground.create(newCampground, function(err, createdCampground){
    if(err){
        console.log(err);
    } else {
        res.redirect("/campgrounds");
    }
   });

});
//NEW ROUTE- SHOW FORM TO CREATE NEW CAMPGROUND
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new");
});

//SHOW ROUTE - SHOW MORE INFORMATION ABOUT A SPECIFIC CAMPGROUND
app.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if (err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: campground});
        }
    });

    
});

//----------------------------
// NEW COMMENTS SHOW ROUTE
//----------------------------

app.get("/campgrounds/:id/comments/new", function(req, res){
    //Step 1) Lookup campground by ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //Step 2) Pass campground data to template
            res.render("comments/new", {campground: campground});
        }
    });
    
});

app.post("/campgrounds/:id/comments", function(req, res){
    //Step 1) Lookup campground by ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

app.listen(port, function(){
    console.log("Now serving on port: " + port);
});