function Deduction(text, vars, premises)
{
  this.text = text;
  this.vars = vars;
  this.premises = premises;
}

var root = new Deduction(undefined, [], []);
var current = root;

function closeGoal(e)
{
  e.stopPropagation();
  current.text = undefined;
  makeBoxes();
}

function closePremise(e)
{
  e.stopPropagation();
  var dom = e.target;
  while (dom.className != 'box') dom = dom.parentNode;
  var index = dom.dataset.index;
  current.premises.splice(index,1);
  makeBoxes();
}

function refreshButtonsFor(el, any)
{
  var buttons = el.getElementsByTagName('*');
  for (var i = 0; i < buttons.length; i++)
  {
    if (buttons[i].dataset.vis == 'vanish')
    {
      if (any)
        buttons[i].style.display = 'none';
      else
        buttons[i].style.removeProperty('display');
    }
    if (buttons[i].dataset.vis == 'appear')
    {
      if (any)
        buttons[i].style.removeProperty('display');
      else
        buttons[i].style.display = 'none';
    }
  }
}

function refreshButtons()
{
  var any = (current.text != undefined);
  refreshButtonsFor(document.getElementById('goal'), any);

  any = (current.premises.length > 0);
  refreshButtonsFor(document.getElementById('premises'), any);
}

function refreshAnnotations()
{
  var fixed_vars = [];
  var common = {};

  for (var i = 0; i < current.vars.length; i++)
  {
    var x = current.vars[i];
    for (var j = 0; j < current.premises.length; j++)
    {
      var premise = current.premises[j];
      for (var k = 0; k < premise.vars.length; k++)
      {
        if (premise.vars[k] == x)
          common[x] = true;
      }
    }
  }

  var boxes = document.getElementsByClassName('box');
  for (var i = 0; i < boxes.length; i++)
  {
    var box = boxes[i];
    var edit = box.getElementsByClassName('edit')[0];
    var title = box.getElementsByClassName('title')[0];

    try {
      var ast = parser(edit.textContent.trim());
      var vars = list_free_variables(ast, common);
      if (vars.length == 0)
        title.textContent = '';
      else
        title.textContent = 'for all ' + vars;
    } catch (e) {
      title.textContent = '?';
    }
  }

  var vars = Object.keys(common);
  vars.sort();
  var title = document.getElementById('fixed');
  title.textContent = '' + vars;
}

function newBox(el, text, type, index)
{
  var buttons = el.getElementsByTagName('*');
  var generator = undefined;
  for (var i = 0; i < buttons.length; i++)
  {
    if (buttons[i].dataset.generate == 'true')
      generator = buttons[i];
  }

  var box = document.createElement('div');
  box.className = 'box';
  box.dataset.isbox = 'true';
  box.dataset.index = index;

  var titlebar = document.createElement('div');
  titlebar.textContent = '';
  titlebar.className = 'titlebar';
  titlebar.addEventListener('click', (type == 'goal') ? targetGoal : targetPremise);

  var close = document.createElement('button');
  close.textContent = 'X';
  close.className = 'close';
  close.addEventListener('click', (type == 'goal') ? closeGoal : closePremise);
  titlebar.appendChild(close);

  var title = document.createElement('span');
  title.name = 'title';
  title.className = 'title';
  titlebar.appendChild(title);

  box.appendChild(titlebar);

  var edit = document.createElement('div');
  edit.className = 'edit';
  edit.contentEditable = true;
  edit.addEventListener('keyup', onKeyUp);
  edit.textContent = text;
  box.appendChild(edit);

  el.insertBefore(box, generator);

  refreshButtons();
}

function newPremiseBox(text, index)
{
  var el = document.getElementById('premises');
  newBox(el, text, 'premise', index);
}

function newGoalBox(text)
{
  var el = document.getElementById('goal');
  newBox(el, text, 'goal', undefined);
}

function removeBoxes()
{
  while (true)
  {
    var boxes = document.getElementsByClassName('box');
    if (boxes.length == 0) return;
    boxes[0].parentNode.removeChild(boxes[0]);
  }
}

function makeBoxes()
{
  removeBoxes();
  if (current.text != undefined) newGoalBox(current.text);
  for (var i = 0; i < current.premises.length; i++)
  {
    newPremiseBox(current.premises[i].text, i);
  }
  refreshButtons();
  refreshAnnotations();
}

function getGoal()
{
  var el = document.getElementById('goal');
  var box = el.getElementsByClassName('box')[0];
  if (box == undefined) return undefined;

  return box.getElementsByClassName('edit')[0].textContent;
}

function getFreeVars(text)
{
  try {
    var ast = parser(text);
    return list_free_variables(ast, {});
  } catch(e) {
    return [];
  }
}

function setModelText()
{
  current.text = getGoal();
  current.vars = getFreeVars(current.text);
  var premiseBoxes = document.getElementById('premises').getElementsByClassName('box');
  if (premiseBoxes.length != current.premises.length) throw "Wrong number of premises in model";

  for (var i = 0; i < current.premises.length; i++)
  {
    var text = premiseBoxes[i].getElementsByClassName('edit')[0].textContent;
    current.premises[i].text = text;
    current.premises[i].vars = getFreeVars(text);
  }
}

function onKeyUp(event)
{
  setModelText();
  refreshAnnotations();
}

function newGoal()
{
  current.text = '';
  makeBoxes();
}

function newPremise(text)
{
  current.premises.push(new Deduction(text, [], []));
  makeBoxes();
}

function rule(r)
{
  var goal = getGoal();
  if (goal == undefined) return;

  var fixed_vars = []; //getFixedVars();
  try
  {
    var premises = applyRuleBackwards(r, goal, fixed_vars);
    for (var i = 0; i < premises.length; i++)
    {
      newPremise(premises[i]);
    }
  } catch (e) {
    alert(e);
  } finally {
    makeBoxes();
  }
}

function findNode(dom)
{
  while (dom.className != 'box') dom = dom.parentNode;

  if (dom.dataset.index == undefined) return current;
  return current.premises[parseInt(dom.dataset.index)];
}

function setCurrent(node)
{
  current = node;
  makeBoxes();
}

function setPremise(r, node)
{
  for (var i = 0; i < r.premises.length; i++)
  {
    if (r.premises[i] == node)
    {
      current = r;
      return true;
    }
    else
    {
      if (setPremise(r.premises[i], node)) return true;
    }
  }
  return false;
}

function targetGoal(e)
{
  if (current == root)
  {
    root = new Deduction(undefined, [], [current]);
    current = root;
  }
  else
  {
    setPremise(root, current);
  }
  makeBoxes();
}

function targetPremise(e)
{
  current = findNode(e.target);
  makeBoxes();
}

