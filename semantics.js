function FreshName(name)
{
  this.name = name;
  this.names = {};
  this.names[name] = true;
  this.probable_type = undefined;
}
function Definition(name, value)
{
  this.name = name;
  this.value = value;
  this.probable_type = Boolean;
}
function Undefined(names, probable_type)
{
  this.names = names;
  this.probable_type = probable_type;
}
function TypeError()
{
  this.names = {};
  this.probable_type = undefined;
}

function is_defined(obj)
{
  return !(obj instanceof FreshName) && !(obj instanceof Undefined) && !(obj instanceof TypeError) && !(obj instanceof Definition);
}

function is_fresh_name(obj)
{
  return obj instanceof FreshName;
}

function is_definition(obj)
{
  return obj instanceof Definition;
}

function is_number(obj)
{
  if (is_defined(obj))
    return obj instanceof Number;
  else
    return obj.probable_type == Number;
}

function is_boolean(obj)
{
  if (is_defined(obj))
    return obj instanceof Boolean;
  else
    return obj.probable_type == Boolean;
}

function is_definitely_true(obj)
{
  return is_defined(obj) && is_boolean(obj) && obj.valueOf();
}

function is_definitely_false(obj)
{
  return is_defined(obj) && is_boolean(obj) && !obj.valueOf();
}

var probable_optypes = {
  '=' : Boolean,
  '<' : Boolean,
  '<=' : Boolean,
  '>' : Boolean,
  '>=' : Boolean,
  '+' : Number,
  '-' : Number,
  '*' : Number,
  '&&' : Boolean,
  '||' : Boolean
};

function perform_op_defined(op, lhs, rhs)
{
  if (op == '=' && is_number(lhs) && is_number(rhs))
    return new Boolean(lhs.valueOf() == rhs.valueOf());
  else if (op == '<' && is_number(lhs) && is_number(rhs))
    return new Boolean(lhs < rhs);
  else if (op == '<=' && is_number(lhs) && is_number(rhs))
    return new Boolean(lhs <= rhs);
  else if (op == '<' && is_number(lhs) && is_number(rhs))
    return new Boolean(lhs > rhs);
  else if (op == '<=' && is_number(lhs) && is_number(rhs))
    return new Boolean(lhs >= rhs);
  
  else if (op == '+' && is_number(lhs) && is_number(rhs))
    return new Number(lhs + rhs);
  else if (op == '-' && is_number(lhs) && is_number(rhs))
    return new Number(lhs - rhs);
  else if (op == '*' && is_number(lhs) && is_number(rhs))
    return new Number(lhs * rhs);

  else if (op == '&&' && is_boolean(lhs) && is_boolean(rhs))
    return new Boolean(lhs && rhs);
  else if (op == '||' && is_boolean(lhs) && is_boolean(rhs))
    return new Boolean(lhs || rhs);

  else
    return new TypeError();
}

function join_undefined(lhs, rhs, probable_type)
{
  var lhs_names = {};
  var rhs_names = {};
  var names = {};

  if (!is_defined(lhs)) lhs_names = lhs.names;
  if (!is_defined(rhs)) rhs_names = rhs.names;

  for (var name in lhs_names)
    names[name] = true;
  for (var name in rhs_names)
    names[name] = true;
  return new Undefined(names, probable_type);
}

function perform_op(op, lhs, rhs)
{
  if (is_defined(lhs) && is_defined(rhs))
  {
    return perform_op_defined(op, lhs, rhs);
  }
  else if (op == '=' && is_fresh_name(lhs) && is_defined(rhs))
  {
    return new Definition(lhs.name, rhs);
  }
  else
  {
    return join_undefined(lhs, rhs, probable_optypes[op]);
  }
}

function semantics(env, ast)
{
  if (ast.type == 'name')
  {
    if (ast.name in env)
      return env[ast.name];
    else
      return new FreshName(ast.name);
  }
  else if (ast.type == 'number')
  {
    return new Number(ast.number);
  }
  else if (ast.type == 'quoted')
  {
    return ast.quoted;
  }
  else if (ast.type == 'tree')
  {
    var lhs = semantics(env, ast.lhs);
    var rhs = semantics(env, ast.rhs);
    return perform_op(ast.op, lhs, rhs);
  }
  else
  {
    throw 'Unrecognized AST node: ' + ast.type;
  }
}
