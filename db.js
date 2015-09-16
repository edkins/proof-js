function importPackage(db, pkg)
{
  if (!db.usesPackage(pkg))
  {
    db.packageNames[pkg.name] = 'importing';
    for (var i = 0; i < pkg.depends.length; i++)
    {
      var dep = findPackage(pkg.depends[i]);
      if (dep == undefined) throw 'Missing package dependency: ' + pkg.depends[i] + ' from ' + pkg.name;
      importPackage(db, dep);
    }
    db.packageNames[pkg.name] = true;
  }
}

function processFreshName(db, name)
{
  var pkg = findPackage(name);
  if (pkg != undefined)
  {
    if (db.usesPackage(pkg))
    {
      return ['already','already'];
    }
    else
    {
      importPackage(db, pkg);
      return ['import','import'];
    }
  }
  return undefined;
}

function processDefinition(db, name, value)
{
  if (name in db.env)
    throw "Wasn't expecting name already to be in database (" + name + ")";
  db.env[name] = value;
  return ['def','definition'];
}

function processHypothesis(db, obj)
{
  if (is_definitely_true(obj))
    return ['already','already'];
  else if (is_definitely_false(obj))
    return ['false','false'];
  return ['hyp','hypothesis'];
}

function processDeduction(db, obj)
{
  if (is_definitely_true(obj))
    return ['true','true'];
  else if (is_definitely_false(obj))
    return ['false','false'];
  return null;
}

function processExpression(db, obj)
{
  return ['expr','expression'];
}

function processObj(db, section, obj)
{
  if (section == 'assume')
  {
    if (is_fresh_name(obj))
      return processFreshName(db, obj.name);
    else if (is_definition(obj))
      return processDefinition(db, obj.name, obj.value);
    else if (is_boolean(obj))
      return processHypothesis(db, obj);
  }
  else if (section == 'deduce')
  {
    if (is_boolean(obj))
      return processDeduction(db, obj);
    else if (is_defined(obj))
      return processExpression(db, obj);
  }
  return undefined;
}

function process(db, section, str)
{
  if (str == '')
  {
    return ['','blank'];
  }
  else
  {
    try {
      var ast = parser(str);
    } catch(e) {
      return ['?','unknown'];
    }
    var obj = semantics(db.env, ast);
    var line = processObj(db, section, obj);

    if (line != undefined) return line;
  }

  return ['?','unknown'];
}

function DB()
{
  this.packageNames = {};
  this.lines = [];
  this.env = {};
}

DB.prototype.isEmpty = function()
{
  return this.lines.length == 0;
}
DB.prototype.usesPackage = function(pkg)
{
  return this.packageNames[pkg.name] != undefined;
};
DB.prototype.pushString = function(section, str)
{
  var line = process(this, section, str);
  this.lines.push({str:str, annotationString:line[0], annotationClass:line[1]});
};
DB.prototype.annotationClass = function(i)
{
  return this.lines[i].annotationClass;
}
DB.prototype.annotationString = function(i)
{
  return this.lines[i].annotationString;
}
DB.prototype.lineCount = function()
{
  return this.lines.length;
}
