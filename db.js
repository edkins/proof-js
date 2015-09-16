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

function understand(db, section, str)
{
  if (str == '')
  {
    return {
      annotationString: '',
      annotationClass: 'blank',
      type: 'blank'
    };
  }
  else if (section == 'assume')
  {
    var pkg = findPackage(str);
    if (pkg != undefined)
    {
      if (db.usesPackage(pkg))
      {
        return {
          annotationString: 'already',
          annotationClass: 'already',
          type: 'import',
          pkg: pkg
        };
      }
      else
      {
        return {
          annotationString: 'import',
          annotationClass: 'import',
          type: 'import',
          pkg: pkg
        };
      }
    }
  }

  return {
    annotationString: '?',
    annotationClass: 'unknown',
    type: 'unknown'
  };
}

function process(db, line)
{
  if (line.type == 'import')
  {
    importPackage(db, line.pkg);
  }
  else if (line.type == 'unknown')
  {
    /* do nothing */
  }
  else
  {
    throw "Internal error: Unrecognized line type";
  }
}

function DB()
{
  this.packageNames = {};
  this.lines = [];
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
  var line = understand(this, section, str);
  this.lines.push(line);
  process(this, line);
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
