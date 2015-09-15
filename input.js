var change_queued = false;

function makeSenseOf(str)
{
  if (str == 'mathematics')
    return 'import';
  else
    return '?';
}

var classes = {
  'import' : 'import',
  '?' : 'unknown',
  '...' : 'editing'
};

function handleKeyDown()
{
  if (!change_queued)
  {
    setTimeout(change, 10);
    change_queued = true;
  }
}

function change()
{
  var e = document.getElementById('editor');
  var range = document.createRange();
  var dump = [];

  e.normalize();
  for (var n = e.firstChild; n != null; n = n.nextSibling)
  {
    if (n instanceof Text || n instanceof HTMLDivElement)
    {
      var str = n.textContent.trim();
      if (str != '')
      {
        range.setStartBefore(n);
        range.setEndAfter(n);
        var rects = range.getClientRects();

        var an = document.createElement('span');
        an.style.left = rects[0].left - 55;
        an.style.top = rects[0].top;
        var anstr = makeSenseOf(str);
        an.textContent = anstr;
        an.className = classes[an.textContent];
        dump.push(an);
      }
    }
  }

  var ans = document.getElementById('annotations');
  while (ans.firstChild)
  {
    ans.removeChild(ans.firstChild);
  }
  for (var i = 0; i < dump.length; i++)
  {
    ans.appendChild(dump[i]);
  }

  change_queued = false;
}

