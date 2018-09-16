// Grab the articles for the front end
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    /* $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>"); */
    var articleCard = $("<div>").addClass("card col-sm-4");
    var articleBody = $("<div>").addClass("card-body");
    var articleTitle = $("<h2>")
      .addClass("card-title")
      .text(data[i].title)
      .attr("data-id", data[i]._id);
    var articleLink = $("<a>").attr("href", data[i].link).addClass('btn btn-primary').text('Read Now');
    var saveArticle = $("<button>").attr("data-id", data[i]._id).attr('id', 'saveThis').addClass('btn btn-primary').text('Save');

    articleBody.append(articleTitle, articleLink, saveArticle);

    articleCard.append(articleBody);

    $('#articles').prepend(articleCard);
  }
});

$(document).on("click", "#saveThis", function(){

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      _id: thisId
    }
  }).then(function(){
    location.reload(true);
  })

});
