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

  var close = document.createElement('button');
  close.textContent = 'X';
  close.addEventListener('click', closeBox);
  box.appendChild(close);

  var edit = document.createElement('div');
  edit.contentEditable = true;
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
