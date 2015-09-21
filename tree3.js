var model;

function fieldChange(event)
{
  var className = event.target.className;
  var els = document.getElementsByClassName(className);

  var text = event.target.innerHTML.replace(new RegExp(event.target.dataset.value,'g'), event.target.dataset.name);

  for (var i = 0; i < els.length; i++)
  {
    if (els[i] != event.target)
    {
      els[i].innerHTML = text.replace(new RegExp(els[i].dataset.name,'g'), els[i].dataset.value);
    }
  }
}

function field(id, text, name, value)
{
  if (name == undefined) name = value = 'zzzzzzzzzzzzzz';
  text = text.replace(name, value);
  return '<span class="field' + id + '" contentEditable="true" onkeyup="fieldChange(event)"' +
    'data-name="' + name + '" data-value="' + value + '"' +
    '>' + text + '</span>';
}

function switchToInduction(name)
{
  var text = 'P(' + name + ')';
  var Px = field(0, text);
  var P0 = field(0, text, name, '0');
  var Py = field(0, text, name, 'y');
  var PS = field(0, text, name, 'S y');
  model = {
    goal: Px,
    rule: 'Induction ' + name,
    premises: [P0, Py + ' -> ' + PS + ' forall y']
    };
}

function switchToTransitive()
{
  var x = field(0,'x');
  var y = field(1,'y');
  var z = field(2,'z');
  model = {
    goal: x + ' = ' + z,
    rule: 'Transitive',
    premises: [x + ' = ' + y, y + ' = ' + z]
  };
}

function switchRule(rule)
{
  if (rule == 'Induction')
    switchToInduction('x');
  else if (rule == 'Transitive')
    switchToTransitive();
}

function selectRule(event)
{
  var select = document.getElementById('ruleSelect')
  var index = select.selectedIndex;
  if (index == -1) return;

  var rule = select.item(index).value;
  switchRule(rule);
  makeBoxes();
}

function makeBox(text, x, y)
{
  var box = document.createElement('div');

  box.className = 'box';
  box.innerHTML = text;
  box.style.top = y + 'px';
  box.style.left = x + 'px';
  box.style.width = 200 + 'px';
  box.style.height = 100 + 'px';

  document.getElementById('main').appendChild(box);
}

function removeBoxes()
{
  var main = document.getElementById('main');
  while (main.firstChild) main.removeChild(main.firstChild);
}

function makeBoxes()
{
  removeBoxes();
  makeBox(model.goal, 200, 0);
  makeBox(model.rule, 200, 120);
  for (var i = 0; i < model.premises.length; i++)
  {
    makeBox(model.premises[i], 200 + i * 220, 240);
  }
}

function init()
{
  model = {goal: '', rule: '', premises: []};
  makeBoxes();
}
