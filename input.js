var status = {};
var text = [];
var nextElementId = 1;

function check(i)
{
  var line = text[i];
  var proved;

  if (line.substr[0] == 'a')
    proved = true;
  else
    proved = false;

  return { proved:proved, recheck:function(){}};
}

function change(i)
{
  var e = document.getElementById('content' + i);
  var an = document.getElementById('annotation' + i);
  text = e.textContent;
  if (text.substr(0,1) == 'a')
  {
    an.textContent = '!';
  }
  else
  {
    an.textContent = '?';
  }
}

function handleKey(e,i)
{
  if (e.keyCode == 13)
  {
    e.preventDefault();

    var el = document.getElementById('row' + i);
    var newel = el.cloneNode(true);
    el.parentNode.insertBefore(newel, el)
  }
}
