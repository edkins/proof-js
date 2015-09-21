var std_vars = {S:true};

function free_variables(ast, bound, free)
{
  if (ast.type == 'name')
  {
    if (!bound[ast.name])
      free[ast.name] = true;
  }
  else if (ast.type == 'number' || ast.type == 'quoted')
  {
    /* nothing to do */
  }
  else if (ast.type == 'tree')
  {
    free_variables(ast.lhs, bound, free);
    free_variables(ast.rhs, bound, free);
  }
  else
    throw "Unrecognized AST node: " + ast.type;
}

function subst(ast, name, value)
{
  if (ast.type == 'name')
  {
    if (ast.name == name)
      return value;
    else
      return ast;
  }
  else if (ast.type == 'number' || ast.type == 'quoted')
  {
    return ast;
  }
  else if (ast.type == 'tree')
  {
    return Tree(
        subst(ast.lhs, name, value),
        ast.opindex,
        subst(ast.rhs, name, value)
        );
  }
  else
    throw "Unrecognized AST node: " + ast.type;
}

function list_free_variables(ast, fixed_vars)
{
  var free = {};
  var bound = Object.create(std_vars);
  for (var v in fixed_vars)
  {
    bound[v] = true;
  }
  free_variables(ast, bound, free);
  var result = Object.keys(free);
  result.sort();
  return result;
}

function all_variables(ast, vars)
{
  if (ast.type == 'name')
    vars[ast.name] = true;
  else if (ast.type == 'number' || ast.type == 'quoted')
  {
    /* nothing to do */
  }
  else if (ast.type == 'tree')
  {
    all_variables(ast.lhs, vars);
    all_variables(ast.rhs, vars);
  }
  else
    throw "Unrecognized AST node: " + ast.type;
}

function fresh_variable(ast, bound)
{
  var vars = Object.create(bound);
  all_variables(ast, vars);
  var suggestions = ['x','y','z','a','b','c'];
  for (var i = 0; i < suggestions.length; i++)
  {
    var x = suggestions[i];
    if (!vars[x]) return x;
  }
  throw "Can't think of a variable name";
}

function Container(vars, premises, goal)
{
  this.vars = vars;
  this.premises = premises;
  this.goal = goal;
}

function isTransitive(op)
{
  return op == '=' || op == '<' || op == '<=' || op == '>' || op == '>=';
}

function isReflexive(op)
{
  return op == '=' || op == '<=' || op == '>=';
}

function suggestRules(goal, fixed_vars)
{
  var result = [];
  try
  {
    var ast = parser(goal);
  } catch (e) {
    return [];
  }

  var free_vars = list_free_variables(ast, fixed_vars);

  if (free_vars.length == 1)
    result.push('induction');

  if (ast.type == 'tree' && isTransitive(ast.op))
    result.push('transitive');

  if (ast.type == 'tree' && isReflexive(ast.op))
    result.push('reflexive');

  if (ast.type == 'tree' && ast.lhs.type == 'tree' && ast.lhs.op == '+' && ast.lhs.lhs.type == 'number' && ast.lhs.lhs.number == 0)
    result.push('0+');

  return result;
}

function deepEqual(lhs, rhs)
{
  if (lhs.type != rhs.type) return false;

  if (lhs.type == 'name')
    return lhs.name == rhs.name;
  else if (lhs.type == 'number')
    return lhs.number == rhs.number;
  else if (lhs.type == 'quoted')
    return lhs.quoted == rhs.quoted;
  else if (lhs.type == 'tree')
    return lhs.op == rhs.op && deepEqual(lhs.lhs, rhs.lhs) && deepEqual(lhs.rhs, rhs.rhs);
  else
    throw "Unrecognized AST node: " + lhs.type;
}

function applyRuleBackwards(rule, goal, fixed_vars)
{
  var ast = parser(goal);
  if (rule == 'induction')
  {
    var free_vars = list_free_variables(ast, fixed_vars);
    if (free_vars.length != 1) throw "Need exactly one free variable to apply induction. Got: " + free_vars;
    var ind_var = free_vars[0];
    var n = Name(fresh_variable(ast, fixed_vars));
    var Sn = binop('@', new Name('S'), n);

    var ast_0 = subst(ast, ind_var, Num(0));
    var ast_n = subst(ast, ind_var, n);
    var ast_S = subst(ast, ind_var, Sn);
    var ast_iH = binop('->', ast_n, ast_S);

    return [ast_str(ast_0), new Container([n.name], [ast_str(ast_n)], ast_str(ast_S))];
  }
  else if (rule == 'reflexive')
  {
    if (ast.type == 'tree' && isReflexive(ast.op) && deepEqual(ast.lhs, ast.rhs))
      return [];
    else
      throw 'LHS and RHS not identical';
  }
  else
  {
    throw "Don't know how to apply rule: " + rule;
  }
}
