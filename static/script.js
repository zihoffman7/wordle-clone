var guesses = [], allowed = true;

function guess(g, r) {
  if (guesses.length >= 6 || g.replace(" ", "").length != 5) {
    return;
  }
  var d = new FormData();
  d.append("guess", g);
  d.append("num", guesses.length);
  $.ajax({
    url: "/req",
    type: "POST",
    processData: false,
    contentType: false,
    dataType : "JSON",
    data: d,
    success: function(data) {
      if (!data.bad) {
        guesses.push(data);
        manipulateBoard();
        for (var i of data.data.cor) {
          $($(r[i[0]]).children()[0]).css("background-color", "yellow");
        }
        for (var i of data.data.pos) {
          $($(r[i[0]]).children()[0]).css("background-color", "lightgreen");
        }
        for (var i of data.data.inc) {
          $($(r[i[0]]).children()[0]).css("background-color", "gainsboro");
        }
        if (data.word) {
          document.body.innerHTML += `<p style="text-align: center;">${data.word}</p><p style="text-align: center;">${data.definition}</p><p style="text-align: center;"><button onclick="location.reload();">Play Again</p>`;
        }
      }
      if (!data.word) {
        allowed = true;
      }
    },
  });
}

function manipulateBoard() {
  $(".row-form").each(function(i, obj) {
    if (i != guesses.length) {
      $(obj).find("input").each(function(j, inp) {
        inp.readOnly = true;
      });
    }
    else {
      $(obj).find("input").each(function(j, inp) {
        inp.readOnly = false;
      });
    }
  });
}

$(function() {
  manipulateBoard();

  $(".char-guess").keyup(function(e) {
    if (this.value.length == this.maxLength) {
      if (this.value == " ") {
        this.value = "";
      }
      var childs = $(this.parentNode.parentNode).children();
      if (e.key == "Backspace") {
        return;
      }
      for (var i = 0; i < childs.length; i++) {
        if ($(childs[i]).children()[0] == this) {
          if (i+1 != childs.length) {
            $(childs[i+1]).children()[0].focus();
          }
          break;
        }
      }
    }
  });

  $(".char-guess").keydown(function(e) {
    var childs = $(this.parentNode.parentNode).children();
    console.log(childs.length)
    if (this.value.length == 0 && e.key == "Backspace") {
      for (var i = 0; i < childs.length; i++) {
        if ($(childs[i]).children()[0] == this) {
          if (i-1 >= 0) {
            $(childs[i-1]).children()[0].focus();
          }
          break;
        }
      }
    }

    else if (e.key == "Enter") {
      if (!allowed) {
        return;
      }
      allowed = false;
      var word = "";
      for (var i = 0; i < childs.length; i++) {
        if ($(childs[i]).children()[0]) {
          if (!$($(childs[i]).children()[0]).val().length) {
            return;
          }
          word += $($(childs[i]).children()[0]).val();
        }
      }
      if (word.replace(" ", "").length == 5) {
        guess(word, childs);
      }
    }
  });
});
