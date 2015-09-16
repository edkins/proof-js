var change_queued = false;

function registerChange(section)
{
  if (!change_queued)
  {
    setTimeout(change, 10);
    change_queued = true;
  }
}

function handleKeyDown(section)
{
  registerChange(section);
}

function handle_section_node(db, positions, section, n)
{
  if (n instanceof HTMLDivElement) n = n.firstChild;
  if (n instanceof Text)
  {
    var str = n.textContent.trim();
    if (str != '')
    {
      db.pushString(section, str);
      
      var range = document.createRange();
      range.setStart(n,0);
      range.setEnd(n,str.length);
      var rects = range.getClientRects();
      positions.push([rects[0].left - 55, rects[0].top, 100 + rects[0].right]);
      if (positions.length != db.lineCount())
      {
        throw 'Internal error: db lines and positions got out of sync';
      }
    }
  }
}

function makeAnnotations(db, positions)
{
  var ans = document.getElementById('annotations');
  while (ans.firstChild)
  {
    ans.removeChild(ans.firstChild);
  }

  for (var i = 0; i < positions.length; i++)
  {
    var str = db.annotationString(i);
    if (str != undefined)
    {
      var an = document.createElement('span');
      an.style.left = positions[i][0];
      an.style.top = positions[i][1];
      an.textContent = str;
      an.className = db.annotationClass(i);
      ans.appendChild(an);
    }
    str = db.remarkString(i);
    if (str != undefined)
    {
      var an = document.createElement('span');
      an.style.left = positions[i][2];
      an.style.top = positions[i][1];
      an.textContent = str;
      an.className = 'remark';
      ans.appendChild(an);
    }
  }
}

function makeSuggestions(db, section)
{
  var sugs = suggest(db, section);
  var innerHTML = '';
  if (sugs.length > 0)
  {
    innerHTML = 'e.g. ';
    for (var i = 0; i < sugs.length; i++)
    {
      if (i > 0) innerHTML += ', ';
      innerHTML += '<a href="#" onclick="suggested(\'' + sugs[i] + '\',\'' + section + '\')">' + sugs[i] + '</a>';
    }
  }
  document.getElementById('suggest_' + section).innerHTML = innerHTML;
}

function suggested(suggestion, section)
{
  document.getElementById(section).innerHTML += '<br>' + suggestion;
  registerChange(section);
}

function processSection(db, positions, section)
{
  var e = document.getElementById(section);
  e.normalize();
  for (var n = e.firstChild; n != null; n = n.nextSibling)
  {
    handle_section_node(db, positions, section, n);
  }
  makeSuggestions(db, section);
}

function change()
{
  try
  {
    var db = new DB();
    var positions = [];

    processSection(db, positions, 'assume');
    processSection(db, positions, 'deduce');

    makeAnnotations(db, positions);
  }
  finally
  {
    change_queued = false;
  }
}

