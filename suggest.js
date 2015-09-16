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

function suggest(db, section)
{
  if (db.isEmpty() && section == 'assume')
  {
    return suggest_packages(db);
  }
  else
  {
    return [];
  }
}
