function closeBox(e)
{
  var box = e.target;
  while (box.className != 'box') box = box.parentNode;

  var el = box.parentNode;
  el.removeChild(box);

  var buttons = el.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++)
  {
    if (buttons[i].className = 'new-vanish')
      buttons[i].style.display = 'inline';
  }
}

function newBox(e)
{
  var button = e.target;
  var el = button.parentNode;
  var box = document.createElement('div');
  box.className = 'box';

  var close = document.createElement('button');
  close.textContent = 'X';
  close.addEventListener('click', closeBox);
  box.appendChild(close);

  var edit = document.createElement('div');
  edit.contentEditable = true;
  box.appendChild(edit);

  el.insertBefore(box, button);

  if (button.className == 'new-vanish')
    button.style.display = 'none';
}
