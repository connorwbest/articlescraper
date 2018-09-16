$.getJSON("/savedArticles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    var articleCard = $("<div>").addClass("card col-sm-4");
    var articleBody = $("<div>").addClass("card-body");
    var articleTitle = $("<h2>")
      .addClass("card-title")
      .text(data[i].title)
      .attr("data-id", data[i]._id);
    var articleLink = $("<a>")
      .attr("href", data[i].link)
      .addClass("btn btn-primary")
      .text("Read Now");
    var note = $("<button>")
      .attr("data-id", data[i]._id)
      .attr("data-toggle", "modal")
      .attr("data-target", "#articleModal")
      .addClass("btn btn-primary noteModal")
      .text("Note");
    var remove = $("<button>")
      .attr("data-id", data[i]._id)
      .addClass("btn btn-primary")
      .text("Remove");

    articleBody.append(articleTitle, articleLink, note, remove);

    articleCard.append(articleBody);

    $("#articles").prepend(articleCard);
  }
});

$(document).on("click", ".noteModal", function() {
  $("#noteValue").empty();
  var thisId = $(this).attr("data-id");
  $(".saveNote").attr("data-id", thisId);

  $.ajax({
    method: "GET",
    url: "/savedArticles/" + thisId
  }).then(function(data) {
    $("#modalTitle").html("<h5>" + data.title + "</h5>");

    $("#noteValue").val(data.note.body);
    console.log(data.title);
    console.log(data.note.body);
  });
});

$(document).on("click", ".saveNote", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/savedArticles/" + thisId,
    data: {
      body: $("#noteValue").val()
    }
  }).then(function(data) {
    // Log the response
    console.log(data);
    $("#articleModal").modal("hide");
    $("#noteValue").empty();
  });
});
