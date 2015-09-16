var pkg_logic = {
  name: 'logic',
  alternative_names: [],
  depends: [],
  contents: []
};

var pkg_math = {
  name: 'mathematics',
  alternative_names: ['math', 'maths'],
  depends: ['logic'],
  contents: []
};

function findPackage(name)
{
  var list = packageList();
  for (var i = 0; i < list.length; i++)
  {
    if (list[i].name == name || list[i].alternative_names.indexOf(name) != -1)
      return list[i];
  }
  return undefined;
}

function packageList()
{
  return [pkg_logic, pkg_math];
}
