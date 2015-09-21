var animating = false;

function Deduction(text, vars, premises, x, y, rel)
{
  this.text = text;
  this.vars = vars;
  this.premises = premises;
  this.complete = (this.text == '') ? 0.0 : 1.0;
  this.visibility = (rel == 'suggested_rule') ? 0.0 : 1.0;
  
  this.hover = false;
  this.x = x;
  this.y = y;
  this.rel = rel;
  this.svg_rect = undefined;
  this.svg_text = undefined;
}

var root = new Deduction('', [], [], 500, 100, 'premise');
var current = root;
var selectedNode = undefined;

function animateSvg(r)
{
  var changed = false;
  var inflate = r.text != '' || r.hover || r == selectedNode;
  if (!inflate && r.complete > 0.0)
  {
    r.complete = Math.max(0.0, r.complete - 0.125);
    changed = true;
  }
  if (inflate && r.complete < 1.0)
  {
    r.complete = Math.min(1.0, r.complete + 0.125);
    changed = true;
  }
  
  var parent = getParent(r);
  var vis = r.rel != 'suggested_rule' || parent == undefined || parent.hover || parent == selectedNode;
  if (!vis && r.visibility > 0.0)
  {
    r.visibility = Math.max(0.0, r.visibility - 0.125);
    changed = true;
  }
  if (vis && r.visibility < 1.0)
  {
    r.visibility = Math.min(1.0, r.visibility + 0.125);
    changed = true;
  }

  if (r.needsRedraw) changed = true;

  if (changed)
  {
    redoSvgFor(r);
    r.needsRedraw = false;
  }
  
  for (var i = 0; i < r.premises.length; i++)
  {
    var subchanged = animateSvg(r.premises[i]);
    changed = changed || subchanged;
  }
  return changed;
}

function svg(type)
{
 var NS='http://www.w3.org/2000/svg';
 return document.createElementNS(NS,type);
}

function removeSvg()
{
  var tree = document.getElementById('tree');
  while (tree.firstChild)
    tree.removeChild(tree.firstChild);
}

function makeSvg()
{
  removeSvg();

  var tree = document.getElementById('tree');

  var cursor = svg('line');
  cursor.setAttribute('x1', 0);
  cursor.setAttribute('y1', 0);
  cursor.setAttribute('x2', 0);
  cursor.setAttribute('y2', 20);
  cursor.setAttribute('stroke', 'red');
  cursor.setAttribute('visibility', 'hidden');
  cursor.id = 'cursor';
  tree.appendChild(cursor);
  
  makeSvgFor(root);
}

function deselect()
{
  document.getElementById('cursor').setAttribute('visibility', 'hidden');
  if (selectedNode != undefined) selectedNode.needsRedraw = true;
  selectedNode = undefined;
  restartAnimation();
}

function clickBackground()
{
  deselect();
  restartAnimation();
}

function getParentRecursive(r, node)
{
  for (var i = 0; i < r.premises.length; i++)
  {
    if (r.premises[i] == node)
      return r;
    var result = getParentRecursive(r.premises[i], node);
    if (result != undefined) return result;
  }
  return undefined;
}

function getParent(node)
{
  return getParentRecursive(root, node);
}

function deleteChildren(parent)
{
  while (parent.premises.length > 0)
  {
    deleteChildren(parent.premises[0]);
    deleteSvgFor(parent.premises[0]);
    parent.premises.splice(0,1);
  }
}

function deleteSuggestions(parent)
{
  for (var i = 0; i < parent.premises.length; i++)
  {
    if (parent.premises[i].rel == 'suggested_rule' || parent.premises[i].text == '')
    {
      deleteChildren(parent.premises[i]);
      deleteSvgFor(parent.premises[i]);
      parent.premises.splice(i,1);
      i--;
    }
  }
}

function newProposition(parent, text, x, y, type)
{
  if (type != 'goal' && type != 'premise') throw 'newProposition: Bad type';
  var node = new Deduction(text, [], [], x, y, type);
  parent.premises.push(node);
  makeSvgFor(node);
  addBlankPremise(node);
  return node;
}

function applyRule(parent, rule)
{
  var goal = parent.text;
  try {
    var children = applyRuleBackwards(rule, goal, []);
  } catch(e) {
    alert(e);
    return;
  }
  deleteChildren(parent);
  for (var i = 0; i < children.length; i++)
  {
    var child;
    var cx = parent.x + (i - (children.length - 1) * 0.5) * 300
    var cy = parent.y + 150
    if (children[i] instanceof Container)
    {
      child = new Deduction('Fix '+children[i].vars, [], [], cx, cy, 'container');
      makeSvgFor(child);

      var subgoal = newProposition(child, children[i].goal, cx, cy + 20, 'goal');

      parent.premises.push(child);

      for (var j = 0; j < children[i].premises.length; j++)
      {
        premise = new Deduction(children[i].premises[j], [], [], cx, cy + 400, 'hypothesis');
        child.premises.push(premise);
        makeSvgFor(premise);
      }
    }
    else
    {
      child = newProposition(parent, children[i], cx, cy, 'premise');
    }
  }
}

function clickRect(event)
{
  var node = event.target.modelNode;
  event.stopPropagation();

  if (node.rel == 'suggested_rule')
  {
    var parent = getParent(getParent(node));
    var rule = node.text;
    applyRule(parent, rule);
  }
  else
  {
    deselect();
    selectedNode = node;
    node.needsRedraw = true;
  }
  restartAnimation();
}

function hoverRect(event)
{
  var node = event.target.modelNode;
  node.hover = true;
  if (node.rel == 'suggested_rule')
  {
    getParent(node).hover = true;
  }
  restartAnimation();
}

function unhoverRect(event)
{
  var node = event.target.modelNode;
  node.hover = false;
  if (node.rel == 'suggested_rule')
  {
    getParent(node).hover = false;
  }
  restartAnimation();
}

function keyDown(event)
{
  if (event.keyCode == 8 || event.keyCode == 32)
  {
    event.preventDefault();
    keyPress(event);
  }
}

function addRuleSuggestions(node, premise)
{
  var rules = suggestRules(node.text,[]);

  for (var i = 0; i < rules.length; i++)
  {
    var x = premise.x - 50 + 100 * (i % 2);
    var y = premise.y - 30 + 30 * Math.floor(i / 2);
    var child = new Deduction(rules[i],[],[], x, y, 'suggested_rule');
    makeSvgFor(child);
    premise.premises.push(child);
  }
}

function addBlankPremise(node)
{
  var premise = new Deduction('',[],[],node.x, node.y + 130, 'premise');
  node.premises.push(premise);
  makeSvgFor(premise);

  addRuleSuggestions(node, premise);
}

function keyPress(event)
{
  if (selectedNode == undefined) return;

  var key;
  if (event.key)
  {
    if (event.key.length == 1)
      key = event.key;
    else
      key = '';
  }
  else
    key = String.fromCharCode(event.keyCode);
 
  if (event.key == 'Backspace' || key == String.fromCharCode(8))
    selectedNode.text = selectedNode.text.substr(0,selectedNode.text.length-1);
  else
    selectedNode.text += key;
  selectedNode.needsRedraw = true;

  if (selectedNode.rel == 'premise' || selectedNode.rel == 'goal')
  {
    /*if (selectedNode == root && selectedNode.text != '')
    {
      root = new Deduction('',[],[selectedNode],selectedNode.x,selectedNode.y - 130, 'premise');
      makeSvgFor(root);
    }*/

    deleteSuggestions(selectedNode);

    if (selectedNode.text != '' && selectedNode.premises.length == 0)
    {
      addBlankPremise(selectedNode);
    }

    /*if (root.text == '')
    {
      if (root.premises.length == 1 && root.premises[0] == selectedNode && selectedNode.text == '')
      {
        deleteSvgFor(root);
        if (current == root) current = selectedNode;
        root = selectedNode;
      }
    }*/
  }

  restartAnimation();
}

function rgb(r,g,b)
{
  return 'rgb(' + Math.floor(255 * r) + ',' + Math.floor(255 * g) + ',' + Math.floor(255 * b) + ')';
}

function redoSvgFor(r)
{
  var rect = r.svg_rect;
  var text = r.svg_text;
  if (rect == undefined) return;
  if (text == undefined) return;
  var x = r.x;
  var y = r.y;
  if (r.x == undefined || r.y == undefined) return;

  var hw, hh, radius, dashes, color, textx = 0, texty = 0, textsize = 30, textcolor = undefined;
  var strokewidth = 4, visibility = 'visible';
  if (r.rel == 'suggested_rule')
  {
    hw = 40;
    hh = 15;
    radius = hh;
    dashes = true;
    color = rgb(1-r.visibility, 1-r.visibility, 1);
    textcolor = rgb(1-r.visibility, 1-r.visibility, 1-r.visibility);
    textsize = 15;
    strokewidth = 1;
    visibility = (r.visibility > 0.0) ? 'visible' : 'hidden';
  }
  else if (r.rel == 'container')
  {
    hw = 150;
    hh = 280;
    y += 210;
    textx -= 0;
    texty -= 262;
    textsize = 20;
    color = textcolor = rgb(0.5,1,0.5);
    radius = 30.0;
    dashes = false;
  }
  else
  {
    hw = 60 + 60 * r.complete;
    hh = 60;
    radius = hh - 50 * r.complete;
    dashes = (r.text == '' && r.complete == 0.0);
    if (r.rel == 'premise' || r.rel == 'goal')
      color = 'blue';
    else if (r.rel == 'hypothesis')
      color = 'purple';
    else
      color = 'red';
  }
  rect.setAttribute('x', x - hw);
  rect.setAttribute('y', y - hh);
  rect.setAttribute('width', 2 * hw);
  rect.setAttribute('height', 2 * hh);
  rect.setAttribute('rx', radius);
  rect.setAttribute('ry', radius);
  rect.setAttribute('fill', 'white');
  rect.setAttribute('stroke', color);
  rect.setAttribute('stroke-width', strokewidth);
  if (dashes)
    rect.setAttribute('stroke-dasharray', '16px, 16px');
  else
    rect.removeAttribute('stroke-dasharray');
  rect.setAttribute('visibility', visibility);

  if (r.text == '' && r.complete < 1.0)
  {
    text.setAttribute('fill', rgb(r.complete, r.complete, r.complete));
    text.textContent = '?';
  }
  else
  {
    text.setAttribute('fill', textcolor ? textcolor : rgb(0,0,0));
    text.textContent = r.text;
  }
  text.setAttribute('x', x + textx);
  text.setAttribute('y', y + texty);
  text.setAttribute('font-size', textsize);
  text.setAttribute('visibility', visibility);

  if (r == selectedNode)
  {
    var cursor = document.getElementById('cursor');
    var cx = x + textx + text.getComputedTextLength() / 2;
    var cy = y + texty;
    if (r.text.substr(r.text.length-1,1) == ' ') cx += 8;
    cursor.setAttribute('x1', cx);
    cursor.setAttribute('y1', cy - 20);
    cursor.setAttribute('x2', cx);
    cursor.setAttribute('y2', cy + 15);
    cursor.setAttribute('visibility', 'visible');
  }
}

function deleteSvgFor(r)
{
  var rect = r.svg_rect;
  if (rect == null) return;
  rect.parentNode.removeChild(rect);
  r.svg_rect = null;

  var text = r.svg_text;
  text.parentNode.removeChild(text);
  r.svg_text = null;
}

function makeSvgFor(r)
{
  var cursor = document.getElementById('cursor');
  var rect = svg('rect');
  r.svg_rect = rect;
  if (r.rel == 'suggested_rule')
    rect.setAttribute('cursor', 'pointer');
  else
    rect.setAttribute('cursor', 'text');
  rect.addEventListener('click', clickRect);
  rect.addEventListener('mouseover', hoverRect);
  rect.addEventListener('mouseout', unhoverRect);
  rect.modelNode = r;
  tree.insertBefore(rect, cursor);

  var text = svg('text');
  r.svg_text = text;
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('font-family', 'sans-serif');
  text.addEventListener('click', clickRect);
  text.addEventListener('mouseover', hoverRect);
  text.addEventListener('mouseout', unhoverRect);
  text.modelNode = r;
  tree.insertBefore(text, cursor);

  redoSvgFor(r);
}

function animTimeout()
{
  animating = animateSvg(root);
  if (animating)
  {
    window.setTimeout(animTimeout, 0.02);
  }
}

function restartAnimation()
{
  if (!animating)
  {
    animating = true;
    window.setTimeout(animTimeout, 0.02);
  }
}
