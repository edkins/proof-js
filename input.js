var status = {};
var text = [];

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

function change()
{
  var e = document.getElementById('editor');
  text = e.innerHTML.split('<br>');
  for (var i = 0; i < text.length; i++)
  {
    var line = text[i];
    if (status[line] == undefined)
    {
      status[line] = check(i);
    }
    else
    {
      status[line].recheck();
    }
  }
  var j = 0;
  var leftAn = document.getElementById('left-annotations');

  while (leftAn.firstChild)
  {
    leftAn.removeChild(leftAn.firstChild);
  }

  for (var i = 0; i < e.childNodes.length; i++)
  {
    var n = e.childNodes[i];
    if (n instanceof HTMLBRElement)
    {
      var y = n.getBoundingClientRect().top;
      var an = document.createTextNode('?');
      leftAn.appendChild(an);
    }
  }
}
