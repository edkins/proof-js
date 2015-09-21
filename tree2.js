function Term(text, type)
{
  this.text = text;
  this.type = type;
  this.contents = undefined;
}

var root = new Term('','prop');
var view = root;

function getParentRecursive(r, node)
{
  if (r.contents == undefined) return undefined;
  for (var i = 0; i < r.contents.length; i++)
  {
    if (r.contents[i] == node) return r;
    var result = getParentRecursive(r.contents[i], node);
    if (result != undefined) return result;
  }
  return undefined;
}

function getParent(node)
{
  return getParentRecursive(root, node);
}

function spliceSiblings0(node)
{
  var siblings = getSiblings(node);
  for (i = 0; i < siblings.length; i++)
  {
    if (siblings[i] == node)
    {
      siblings.splice(i,1);
      return;
    }
  }
  throw "Shouldn't get here";
}

function spliceSiblings3(node, r0, r1, r2)
{
  var siblings = getSiblings(node);
  for (i = 0; i < siblings.length; i++)
  {
    if (siblings[i] == node)
    {
      siblings.splice(i,1,r0,r1,r2);
      return;
    }
  }
  throw "Shouldn't get here";
}

function getNextSibling(node)
{
  var siblings = getSiblings(node);
  for (i = 1; i < siblings.length; i++)
  {
    if (siblings[i - 1] == node) return siblings[i];
  }
  return undefined;
}

function getPreviousSibling(node)
{
  var siblings = getSiblings(node);
  for (i = 0; i < siblings.length - 1; i++)
  {
    if (siblings[i + 1] == node) return siblings[i];
  }
  return undefined;
}

function getSiblings(node)
{
  if (node == root)
    return [node];
  else
    return getParent(node).contents;
}

function makeContents(node)
{
  node.contents = undefined;

  try {
    var ast = parser(node.text);
    if (ast.type == 'tree')
    {
      node.contents = [
        new Term(ast_str(ast.lhs),'term'),
        new Term(ast.op, 'op'),
        new Term(ast_str(ast.rhs),'term')
          ];
    }
  } catch(e) {
    alert('Cannot parse contents: ' + e);
  }
}

function canSplit()
{
  return view.type == 'op';
}

function split()
{
  if (view.type != 'op') { alert('Not an operator'); return; }
  var term = new Term('','term');
  var op = new Term(view.text, 'op');
  spliceSiblings3(view, view, term, op);
  view = term;
  makeBoxes();
}

function canDelete()
{
  return getSiblings(view).length > 1;
}

function deleteNode()
{
  var next = getNextSibling(view);
  if (next == undefined) next = getPreviousSibling(view);
  if (next == undefined) { alert('Can only delete if there are siblings'); return; }
  spliceSiblings0(view);
  view = next;
  makeBoxes();
}

function canZoomIn()
{
  return true;  /* well, maybe. */
}

function zoomIn()
{
  if (view.contents == undefined)
    makeContents(view);

  if (view.contents == undefined || view.contents.length == 0) return;

  view = view.contents[0];
  makeBoxes();
}

function canZoomOut()
{
  return view != root;
}

function zoomOut()
{
  if (view == root) { alert('Already at root level'); return; }

  view = getParent(view);
  makeBoxes();
}

function canGoLeft()
{
  return getPreviousSibling(view) != undefined;
}

function left()
{
  var prev = getPreviousSibling(view);
  if (prev == undefined) return;
  view = prev;
  makeBoxes();
}

function canGoRight()
{
  return getNextSibling(view) != undefined;
}

function right()
{
  var next = getNextSibling(view);
  if (next == undefined) return;
  view = next;
  makeBoxes();
}

function onChange(event)
{
  view.text = event.target.textContent.trim();
}

function makeBoxes()
{
  var main = document.getElementById('main');
  while (main.firstChild) main.removeChild(main.firstChild);

  var siblings = getSiblings(view);
  var x = 50;

  for (var i = 0; i < siblings.length; i++)
  {
    var box = document.createElement('div');
    var node = siblings[i];
    var w = (node.type == 'op') ? 50 : 300;
    var h = (node.type == 'op') ? 50 : 100;
    var y = 200 - h/2;

    box.className = (node == view) ? 'box-selected' : 'box';
    box.contentEditable = true;
    box.style.left = x;
    box.style.top = y;
    box.style.width = w;
    box.style.height = h;
    box.textContent = node.text;
    box.addEventListener('keyup', onChange);

    main.appendChild(box);

    x += w + 50;
  }

  document.getElementById('leftButton').disabled = !canGoLeft();
  document.getElementById('zoomInButton').disabled = !canZoomIn();
  document.getElementById('zoomOutButton').disabled = !canZoomOut();
  document.getElementById('rightButton').disabled = !canGoRight();
  document.getElementById('splitButton').disabled = !canSplit();
  document.getElementById('deleteButton').disabled = !canDelete();
}

function init()
{
  makeBoxes();
}
