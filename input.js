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
  if (n instanceof HTMLDivElement || n instanceof HTMLParagraphElement) n = n.firstChild;
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
      positions.push([
        window.pageXOffset + rects[0].left - 55,
        window.pageYOffset + rects[0].top, 
        window.pageXOffset + 100 + rects[0].right,
        n]);
      if (positions.length != db.lineCount())
      {
        throw 'Internal error: db lines and positions got out of sync';
      }
    }
  }
}

function move_to_deduce(node)
{
  var str = node.textContent;
  node.parentNode.removeChild(node);
  registerChange('assume');
  suggested(str, 'deduce');
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
      an.style.left = positions[i][0] + 'px';
      an.style.top = positions[i][1] + 'px';
      an.className = db.annotationClass(i);
      an.textContent = str;
      an.relatedNode = positions[i][3];
      if (an.className == 'can_deduce')
      {
        an.addEventListener('click', function() { move_to_deduce(this.relatedNode); });
      }
      ans.appendChild(an);
    }
    str = db.remarkString(i);
    if (str != undefined)
    {
      var an = document.createElement('span');
      an.style.left = positions[i][2] + 'px';
      an.style.top = positions[i][1] + 'px';
      an.textContent = str;
      an.className = 'remark';
      ans.appendChild(an);
    }
  }
}

function makeSuggestions(db, section)
{
  var el = document.getElementById('suggest_' + section);
  var sugs = suggest(db, section);

  while (el.firstChild)
    el.removeChild(el.firstChild);

  if (sugs.length > 0)
  {
    innerHTML = 'e.g. ';
    for (var i = 0; i < sugs.length; i++)
    {
      if (i == 0)
        el.appendChild(document.createTextNode('e.g. '));
      else
        el.appendChild(document.createTextNode(', '));

      var span = document.createElement('span');
      span.className = 'suggestion';
      span.textContent = sugs[i];
      span.addEventListener('click', function() {suggested(this.textContent, section);});
      el.appendChild(span);
    }
  }
}

function suggested(suggestion, section)
{
  var el = document.getElementById(section);
  if (el.lastChild instanceof HTMLBRElement)
    el.removeChild(el.lastChild);
  el.appendChild(document.createTextNode(suggestion));
  el.appendChild(document.createElement('br'));
  el.appendChild(document.createElement('br'));
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

