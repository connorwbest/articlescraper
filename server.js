var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Scraping Tools
var request = require("request");
var cheerio = require("cheerio");

// Require all our models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Serve our public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

app.get("/scrape", function(req, res) {
  request("https://www.theverge.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    if (!error && response.statusCode == 200) {
      $("h2.c-entry-box--compact__title").each(function(i, element) {
        var result = {};

        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
    }

    res.sendFile(__dirname + "/public/index.html");
  });
});

app.get("/saved", function(req, res) {
  res.sendFile(__dirname + "/public/saved.html");
});

app.get("/savedArticles", function(req, res) {
  db.Article.find({ saved: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting all the Articles
app.get("/articles", function(req, res) {
  db.Article.find({ saved: false })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Update an article to saved
app.post("/articles/:id", function(req, res) {
  db.Article.find(req.body)
    .then(function(data) {
      return db.Article.updateOne(
        { _id: req.body._id },
        { saved: true },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Grab Article and return the note associated with it
app.get("/savedArticles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// saving/updating an Article's associated Note
app.post("/savedArticles/:id", function(req, res) {
    console.log(req.params.id);  
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      
      return db.Article.findByIdAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      console.log(dbArticle);
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
