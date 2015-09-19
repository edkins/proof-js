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

    return [ast_str(ast_0), ast_str(ast_iH)];
  }
  else
  {
    throw "Don't know how to apply rule: " + rule;
  }
}
