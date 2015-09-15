function change(i)
{
  var e = document.getElementById('editor');
  var range = document.createRange();
  var dump = document.getElementById('annotations');

  while (dump.firstChild)
  {
    dump.removeChild(dump.firstChild);
  }

  e.normalize();
  for (var n = e.firstChild; n != null; n = n.nextSibling)
  {
    if (n instanceof Text)
    {
      var str = n.textContent.trim();
      if (str != '')
      {
        range.setStartBefore(n);
        range.setEndAfter(n);
        var rects = range.getClientRects();

        var an = document.createElement('span');
        an.style.left = rects[0].left - 25;
        an.style.top = rects[0].top;
        an.textContent = str.length;
        dump.appendChild(an);
      }
    }
  }
}

