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
}

function list_free_variables(ast, bound)
{
  var free = {};
  free_variables(ast, bound, free);
  var result = Object.keys(free);
  result.sort();
  return result;
}
