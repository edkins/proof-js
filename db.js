function importPackageContents(db, pkg)
{
  for (var op in pkg.operators)
  {
    if (op in db.env) throw 'Already defined: ' + op;
    db.env[op] = pkg.operators[op];
  }

  for (var name in pkg.names)
  {
    if (name in db.env) throw 'Already defined: ' + name;
    db.env[name] = pkg.names[name];
  }

  for (var special in pkg.specials)
  {
    if (special in db.env) throw 'Already defined: ' + special;
    db.env[special] = pkg.specials[special];
  }
}

function importPackage(db, pkg, remark)
{
  if (!db.usesPackage(pkg))
  {
    db.packageNames[pkg.name] = remark;
    importPackageContents(db, pkg);
    for (var i = 0; i < pkg.depends.length; i++)
    {
      var dep = findPackage(pkg.depends[i]);
      if (dep == undefined) throw 'Missing package dependency: ' + pkg.depends[i] + ' from ' + pkg.name;
      importPackage(db, dep, remark);
    }
  }
}

function processFreshName(db, name)
{
  var pkg = findPackage(name);
  if (pkg != undefined)
  {
    if (db.usesPackage(pkg))
    {
      return ['already','already','Part of ' + db.packageNames[pkg.name]];
    }
    else
    {
      try {
        importPackage(db, pkg, name);
        return ['import','import',undefined];
      } catch(e) {
        return ['fail','fail',e];
      }
    }
  }
  return undefined;
}

function processDefinition(db, name, value)
{
  if (name in db.env)
    throw "Wasn't expecting name already to be in database (" + name + ")";
  db.env[name] = value;
  return ['def','definition',undefined];
}

function processHypothesis(db, obj)
{
  if (is_definitely_true(obj))
    return ['already','can_deduce',undefined];
  else if (is_definitely_false(obj))
    return ['false','false',undefined];

  var remark = undefined;
  for (var name in obj.names)
  {
    if (!(name in db.env))
    {
      db.env[name] = new IntroducedName(name);
      if (remark == undefined)
        remark = 'Introducing ' + name;
      else
        remark += ', ' + name;
    }
  }
  return ['hyp','hypothesis',remark];
}

function processDeduction(db, obj)
{
  if (is_definitely_true(obj))
    return ['true','true',undefined];
  else if (is_definitely_false(obj))
    return ['false','false',undefined];
  return null;
}

function processExpression(db, obj)
{
  return ['expr','expression',obj.toString()];
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
    return [undefined,undefined,undefined];
  }
  else
  {
    try {
      var ast = parser(str);
    } catch(e) {
      return ['?','unknown',undefined];
    }
    var obj = semantics(db.env, ast);
    var line = processObj(db, section, obj);

    if (line != undefined) return line;
  }

  return ['?','unknown',undefined];
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
  this.lines.push({str:str, annotationString:line[0], annotationClass:line[1], remarkString:line[2]});
};
DB.prototype.annotationClass = function(i)
{
  return this.lines[i].annotationClass;
}
DB.prototype.annotationString = function(i)
{
  return this.lines[i].annotationString;
}
DB.prototype.remarkString = function(i)
{
  return this.lines[i].remarkString;
}
DB.prototype.lineCount = function()
{
  return this.lines.length;
}
