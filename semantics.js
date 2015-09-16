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
function UndefinedSyntax(msg)
{
  this.names = {};
  this.probable_type = undefined;
  this.msg = msg;
}
function IntroducedName(name)
{
  this.names = {};
  this.probable_type = undefined;
}

function is_defined(obj)
{
  return !(obj instanceof FreshName) &&
    !(obj instanceof IntroducedName) &&
    !(obj instanceof Undefined) &&
    !(obj instanceof TypeError) &&
    !(obj instanceof Definition) &&
    !(obj instanceof UndefinedSyntax);
}

function is_malformed(obj)
{
  return obj instanceof TypeError || obj instanceof UndefinedSyntax;
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

function probableOptype(env, op)
{
  if (!(op in env)) return undefined;
  return env[op].probable_type;
}

function perform_op_defined(env, op, lhs, rhs)
{
  if (!is_defined(lhs)) throw 'lhs not defined';
  if (!is_defined(rhs)) throw 'rhs not defined';
  if (!(op in env)) {
    var names = {};
    names[op] = true;
    return new Undefined(names,undefined);
  }
  if (!env[op].typecheck(lhs, rhs))
    return new TypeError();
  return env[op].eval(lhs, rhs);
}

function join_undefined(lhs, rhs, probable_type)
{
  var lhs_names = {};
  var rhs_names = {};
  var names = {};

  if (is_malformed(lhs)) return lhs;
  if (is_malformed(rhs)) return rhs;

  if (!is_defined(lhs)) lhs_names = lhs.names;
  if (!is_defined(rhs)) rhs_names = rhs.names;

  for (var name in lhs_names)
    names[name] = true;
  for (var name in rhs_names)
    names[name] = true;
  return new Undefined(names, probable_type);
}

function perform_op(env, op, lhs, rhs)
{
  if (is_defined(lhs) && is_defined(rhs))
  {
    return perform_op_defined(env, op, lhs, rhs);
  }
  else if (op == '=' && is_fresh_name(lhs) && is_defined(rhs))
  {
    return new Definition(lhs.name, rhs);
  }
  else
  {
    return join_undefined(lhs, rhs, probableOptype(env, op));
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
    if ('<number>' in env)
      return new Number(ast.number);
    else
      return new UndefinedSyntax('<number>');
  }
  else if (ast.type == 'quoted')
  {
    if ('<quoted>' in env)
      return ast.quoted;
    else
      return new UndefinedSyntax('<quoted>');
  }
  else if (ast.type == 'tree')
  {
    var lhs = semantics(env, ast.lhs);
    var rhs = semantics(env, ast.rhs);
    return perform_op(env, ast.op, lhs, rhs);
  }
  else
  {
    throw 'Unrecognized AST node: ' + ast.type;
  }
}
