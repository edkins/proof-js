var pkg_logic = {
  name: 'logic',
  alternative_names: [],
  depends: [],
  specials: {},
  names: {
    'true' : new Boolean(true),
    'false' : new Boolean(false)
  },
  operators: {
    '=' : new Operator(
      Boolean,
      function(a, b) { return is_number(a) && is_number(b) || is_boolean(a) && is_boolean(b); },
      function(a, b) { return new Boolean(a.valueOf() == b.valueOf()); }
    ),
    '&&' : new Operator(
      Boolean,
      function(a, b) { return is_boolean(a) && is_boolean(b); },
      function(a, b) { return new Boolean(a.valueOf() && b.valueOf()); }
    ),
    '||' : new Operator(
      Boolean,
      function(a, b) { return is_boolean(a) && is_boolean(b); },
      function(a, b) { return new Boolean(a.valueOf() || b.valueOf()); }
    )
  }
};

var pkg_math = {
  name: 'mathematics',
  alternative_names: ['math', 'maths'],
  depends: ['logic'],
  specials: {'<number>':new Special()},
  names: {},
  operators: {
    '+' : new Operator(
      Number,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Number(a + b); }
    ),
    '-' : new Operator(
      Number,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Number(a - b); }
    ),
    '*' : new Operator(
      Number,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Number(a * b); }
    ),

    '<' : new Operator(
      Boolean,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Boolean(a < b); }
    ),
    '<=' : new Operator(
      Boolean,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Boolean(a <= b); }
    ),
    '>' : new Operator(
      Boolean,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Boolean(a > b); }
    ),
    '>=' : new Operator(
      Boolean,
      function(a, b) { return is_number(a) && is_number(b); },
      function(a, b) { return new Boolean(a >= b); }
    ),
  }
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
