function closeBox(e)
{
  var box = e.target;
  while (box.className != 'box') box = box.parentNode;

  var el = box;
  while (el.className != 'slice') el = el.parentNode;

  var buttons = el.getElementsByTagName('*');
  var count = 0;
  for (var i = 0; i < buttons.length; i++)
  {
    if (buttons[i].dataset.isbox == 'true')
      count++;
  }

  el.removeChild(box);

  if (count == 1)
  {
    for (var i = 0; i < buttons.length; i++)
    {
      if (buttons[i].dataset.vis == 'vanish')
        buttons[i].style.removeProperty('display');
      if (buttons[i].dataset.vis == 'appear')
        buttons[i].style.display = 'none';
    }
  }
}

function onKeyUp(event)
{
  var fix_edit = document.getElementsByClassName('fixedit')[0];
  var fixed_var_list = fix_edit.textContent.split(',');
  var fixed_vars = {};
  for (var i = 0; i < fixed_var_list.length; i++)
  {
    fixed_vars[fixed_var_list[i].trim()] = true;
  }

  var boxes = document.getElementsByClassName('box');
  for (var i = 0; i < boxes.length; i++)
  {
    var box = boxes[i];
    var edit = box.getElementsByClassName('edit')[0];
    var title = box.getElementsByClassName('title')[0];

    try {
      var ast = parser(edit.textContent.trim());
      var vars = list_free_variables(ast, fixed_vars);
      if (vars.length == 0)
        title.textContent = '';
      else
        title.textContent = 'for all ' + vars;
    } catch (e) {
      title.textContent = '?';
    }
  }
}

function newBox(e)
{
  var el = e.target;
  while (el.className != 'slice') el = el.parentNode;

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

  var titlebar = document.createElement('div');
  titlebar.textContent = '';
  titlebar.className = 'titlebar';

  var close = document.createElement('button');
  close.textContent = 'X';
  close.className = 'close';
  close.addEventListener('click', closeBox);
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
  box.appendChild(edit);

  el.insertBefore(box, generator);

  for (var i = 0; i < buttons.length; i++)
  {
    if (buttons[i].dataset.vis == 'vanish')
      buttons[i].style.display = 'none';
    if (buttons[i].dataset.vis == 'appear')
      buttons[i].style.removeProperty('display');
  }
}
