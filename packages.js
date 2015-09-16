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
    '=' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_number(a) && is_number(b) || is_boolean(a) && is_boolean(b); },
      eval: function(a, b) { return new Boolean(a.valueOf() == b.valueOf()); }
    },
    '&&' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_boolean(a) && is_boolean(b); },
      eval: function(a, b) { return new Boolean(a.valueOf() && b.valueOf()); }
    },
    '||' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_boolean(a) && is_boolean(b); },
      eval: function(a, b) { return new Boolean(a.valueOf() || b.valueOf()); }
    }
  }
};

var pkg_math = {
  name: 'mathematics',
  alternative_names: ['math', 'maths'],
  depends: ['logic'],
  specials: {'<number>':true},
  names: {},
  operators: {
    '+' : {
      probable_type: Number,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Number(a + b); }
    },
    '-' : {
      probable_type: Number,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Number(a - b); }
    },
    '*' : {
      probable_type: Number,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Number(a * b); }
    },

    '<' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Boolean(a < b); }
    },
    '<=' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Boolean(a <= b); }
    },
    '>' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Boolean(a > b); }
    },
    '>=' : {
      probable_type: Boolean,
      typecheck: function(a, b) { return is_number(a) && is_number(b); },
      eval: function(a, b) { return new Boolean(a >= b); }
    },
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
