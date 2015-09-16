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

function fresh_prop_name(db)
{
  markings = '';
  while (true)
  {
    if (!('P'+markings in db.env)) return 'P'+markings;
    if (!('Q'+markings in db.env)) return 'Q'+markings;
    if (!('R'+markings in db.env)) return 'R'+markings;
    markings += "'";
  }
}

function fresh_var_name(db)
{
  markings = '';
  while (true)
  {
    if (!('x'+markings in db.env)) return 'x'+markings;
    if (!('y'+markings in db.env)) return 'y'+markings;
    if (!('z'+markings in db.env)) return 'z'+markings;
    if (!('a'+markings in db.env)) return 'a'+markings;
    if (!('b'+markings in db.env)) return 'b'+markings;
    if (!('c'+markings in db.env)) return 'c'+markings;
    markings += "'";
  }
}

function fresh_numeral(db, avoid)
{
  var num = 0;
  while (num <= 9)
  {
    var found = avoid.indexOf(''+num) != -1;
    for (var i = 0; i < db.lines.length; i++)
    {
      if (db.lines[i].str.indexOf(''+num) != -1) found = true;
    }
    if (!found) return num;
    num++;
  }
}

function suggest_number(db, avoid)
{
  for (var name in db.env)
  {
    if (is_number(db.env[name]) && avoid.indexOf(name) == -1)
      return name;
  }
  return fresh_numeral(db, avoid);
}

function suggest_boolean(db, avoid)
{
  if (!('true' in db.env)) return undefined;
  for (var name in db.env)
  {
    if (is_boolean(db.env[name]) && avoid.indexOf(name) == -1)
      return name;
  }
  return 'true';
}

function op_is_fresh(db, op, avoid)
{
  if (avoid.indexOf(op) != -1) return false;
  for (var i = 0; i < db.lines.length; i++)
  {
    if (db.lines[i].str.indexOf(op) != -1) return false;
  }
  return true;
}

function suggest_def_binop(db, avoid)
{
  if ('+' in db.env && op_is_fresh(db, '+', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return fresh_var_name(db) + ' = ' + x + '+' + y;
  }
  if ('-' in db.env && op_is_fresh(db, '-', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return fresh_var_name(db) + ' = ' + x + '-' + y;
  }
  if ('*' in db.env && op_is_fresh(db, '*', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return fresh_var_name(db) + ' = ' + x + '*' + y;
  }
}

function suggest_binop(db, avoid)
{
  if ('+' in db.env && op_is_fresh(db, '+', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + '+' + y;
  }
  if ('-' in db.env && op_is_fresh(db, '-', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + '-' + y;
  }
  if ('*' in db.env && op_is_fresh(db, '*', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + '*' + y;
  }
}

function suggest_def_bool(db, avoid)
{
  var b = suggest_boolean(db, avoid);
  if (b != undefined)
  {
    return fresh_prop_name(db, avoid) + ' = ' + b;
  }
  return undefined;
}

function suggest_rel(db, avoid)
{
  if ('<number>' in db.env && '<' in db.env && op_is_fresh(db, '<', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + ' < ' + y;
  }
  if ('<number>' in db.env && '<=' in db.env && op_is_fresh(db, '<=', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + ' <= ' + y;
  }
  if ('<number>' in db.env && '>' in db.env && op_is_fresh(db, '>', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + ' > ' + y;
  }
  if ('<number>' in db.env && '>=' in db.env && op_is_fresh(db, '>=', avoid))
  {
    var x = suggest_number(db, avoid);
    var y = suggest_number(db, avoid + x);
    return x + ' >= ' + y;
  }
}

function suggest_bool_op(db, avoid)
{
  if ('&&' in db.env && op_is_fresh(db, '&&', avoid))
  {
    var x = suggest_boolean(db, avoid);
    var y = suggest_boolean(db, avoid + x);
    return x + ' && ' + y;
  }
  if ('||' in db.env && op_is_fresh(db, '||', avoid))
  {
    var x = suggest_boolean(db, avoid);
    var y = suggest_boolean(db, avoid + x);
    return x + ' || ' + y;
  }
}

function suggest_misc(db, section)
{
  var result = [];
  var result_string = '';
  var str;
  if (section == 'assume')
  {
    str = suggest_def_binop(db, result_string);
    if (str != undefined && str.indexOf('undefined') == -1)
    {
      result.push(str);
      result_string += str + ', ';
    }

    str = suggest_def_bool(db, result_string);
    if (str != undefined && str.indexOf('undefined') == -1)
    {
      result.push(str);
      result_string += str + ', ';
    }
  }

  if (section == 'deduce')
  {
    str = suggest_binop(db, result_string);
    if (str != undefined && str.indexOf('undefined') == -1)
    {
      result.push(str);
      result_string += str + ', ';
    }
  }

  str = suggest_rel(db, result_string);
  if (str != undefined && str.indexOf('undefined') == -1)
  {
    result.push(str);
    result_string += str + ', ';
  }

  str = suggest_bool_op(db, result_string);
  if (str != undefined && str.indexOf('undefined') == -1)
  {
    result.push(str);
    result_string += str + ', ';
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
    return suggest_misc(db, section);
  }
}
