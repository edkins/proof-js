function suggest_packages(db)
{
  var list = packageList();
  var result = [];
  for (var i = 0; i < list.length; i++)
  {
    if (!db.usesPackage(list[i]))
    {
      result.push(list[i].name);
    }
  }
  return result;
}

function suggest_each(db, section)
{
  var result = [];
  for (var name in db.env)
  {
    var obj = db.env[name];
    var sug = undefined;
    if (obj instanceof Operator)
      sug = 'x ' + name + ' y';
    else if (obj instanceof Special && name == '<number>')
      sug = '2';
    else
      sug = name;

    if (sug != undefined)
      result.push(sug);
  }
  return result;
}

function suggest(db, section)
{
  if (db.isEmpty() && section == 'assume')
  {
    return suggest_packages(db);
  }
  else
  {
    return suggest_each(db, section);
  }
}
