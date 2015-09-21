var theString;
var thePos;

var operator_table = [
  {op: '@', dir:'left', optype:'infix', level:0},   // function application. f @ x = f x.
  {op: '!', dir:'left', optype:'infix', level:0},
  {op: '/', dir:'left', optype:'infix', level:1},
  {op: '*', dir:'left', optype:'infix', level:1},
  {op: '-', dir:'left', optype:'infix', level:2},
  {op: '+', dir:'left', optype:'infix', level:2},
  {op: '<', dir:'left', optype:'infix', level:3},
  {op: '<=',dir:'left', optype:'infix', level:3},
  {op: '>', dir:'left', optype:'infix', level:3},
  {op: '>=',dir:'left', optype:'infix', level:3},
  {op: '=', dir:'left', optype:'infix', level:3},
  {op: ':=',dir:'left', optype:'infix', level:4},
  {op: '&&',dir:'left', optype:'infix', level:5},
  {op: '||',dir:'left', optype:'infix', level:5},
  {op: '->',dir:'right',optype:'infix', level:6},
  {op: '>>',dir:'right',optype:'infix', level:6},
  {op: ',', dir:'left', optype:'infix', level:7},
  {op: ';', dir:'left', optype:'infix', level:8},
  {op: ':', dir:'left', optype:'infix', level:9},
  {op: '.', dir:'left', optype:'separator', level:9}
];

function Unit()
{
  return {type: 'unit'};
}
function Name(n)
{
  return {type: 'name', name:n, infix:false};
}
function Num(n)
{
  return {type: 'number', number:n, infix:false};
}
function Quoted(s)
{
  return {type: 'quoted', str:s, infix:false};
}
function Decl(n, e)
{
  return {type: 'decl', name: n, expr: e};
}
function Infix(opindex)
{
  return {type: 'infix', opindex: opindex, infix: true};
}
function Tree(lhs, opindex, rhs)
{
  return {type: 'tree', lhs:lhs, op:operator_table[opindex].op, opindex:opindex, rhs:rhs, infix: false};
}

function ast_str(obj, target)
{
  var level = -1;
  var result;
  if (obj.type == 'name') result = obj.name;
  else if (obj.type == 'number') result = '' + obj.number;
  else if (obj.type == 'quoted') result = '"' + obj.str + '"';
  else if (obj.type == 'tree')
  {
    level = obj.opindex;
    var lhs_level = level;
    if (operator_table[obj.opindex].dir == 'left') lhs_level++;
    var rhs_level = level;
    if (operator_table[obj.opindex].dir == 'right') rhs_level++;
    var op = operator_table[obj.opindex].op;
    if (op == ':') op = '\n  :';
    if (op == '.') op = '\n.';
    if (op == '@') op = ' ';
    result = ast_str(obj.lhs,lhs_level) + op + ast_str(obj.rhs,rhs_level);
  }
  else result = '<' + obj.type + '>';

  if (target <= level)
    result = '(' + result + ')';
  return result;
}

function printAST(obj)
{
  console.log(ast_str(obj, 1000));
}

function spaces(level)
{
  var result = '';
  for (var i = 0; i < level; i++)
    result += ' ';
  return result;
}

function ast_long(obj, level)
{
  if (obj.type == 'name')
    console.log(spaces(level) + obj.name);
  else if (obj.type == 'number')
    console.log(spaces(level) + obj.number);
  else if (obj.type == 'quoted')
    console.log(spaces(level) + '"' + obj.str + '"');
  else if (obj.type == 'tree')
  {
    ast_long(obj.lhs, level + 1);
    console.log(spaces(level) + operator_table[obj.opindex].op);
    ast_long(obj.rhs, level + 1);
  }
  else
    console.log(spaces(level) + '<' + obj.type + '>');
}

function printASTLong(obj)
{
  ast_long(obj, 0);
}

function eof()
{
  return thePos == theString.length;
}

function peekChar()
{
  return theString.substr(thePos,1);
}

function isWhitespace(ch)
{
  return ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n';
}

function whitespace()
{
  while (!eof() && isWhitespace(peekChar()))
  {
    thePos++;
  }
}

function closing()
{
  if (eof()) return true;
  var ch = peekChar();
  if (ch == ')' || ch == ']' || ch == '}') return true;
  return false;
}

function name()
{
  var n = '';
  while (true)
  {
    if (eof()) break;
    var ch = peekChar();
    if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9' || ch == '_' || ch == "'")
    {
      n += ch;
      thePos++;
    }
    else break;
  }
  if (n == '') throw 'Expected <name>';
  whitespace();
  return Name(n);
}

function number()
{
  var n = 0;
  var empty = true;
  while (true)
  {
    if (eof()) break;
    var ch = peekChar();
    if (ch >= '0' && ch <= '9')
    {
      n = n * 10 + (ch - '0');
      thePos++;
      empty = false;
    }
    else break;
  }
  if (empty) throw 'Expected <number>';
  whitespace();
  return Num(n);
}

function symbol(sym)
{
  for (var i = 0; i < sym.length; i++)
  {
    if (eof()) throw 'Expected "' + sym + '"';
    var ch = peekChar();
    if (ch != sym.substr(i,1)) throw 'Expected "' + sym + '"';
    thePos++;
  }
  whitespace();
  return Unit();
}

function parenthesised()
{
  symbol('(');
  var e = expr();
  symbol(')');
  whitespace();
  return e;
}

function isSymbolChar(ch)
{
  return "!#$%&*+,-./:;<=>?@\\^|~".indexOf(ch) != -1;
}

function lookup_op(op)
{
  for (var i = 0; i < operator_table.length; i++)
  {
    if (operator_table[i].op == op)
      return Infix(i);
  }
  throw 'No such infix operator: "' + op + '"';
}

function binop(op, lhs, rhs)
{
  return Tree(lhs, lookup_op(op).opindex, rhs);
}

function infix()
{
  var n = '';
  var index;
  while (true)
  {
    if (eof()) break;
    var ch = peekChar();
    if (isSymbolChar(ch))
    {
      n += ch;
      thePos++;
    }
    else break;
  }
  if (n == '') throw 'Expected <operator>';
  whitespace();
  return lookup_op(n);
}

function quoted()
{
  var s = '';
  if (eof() || peekChar() != '"') throw 'Expected <quoted>';
  thePos++;
  while (true)
  {
    if (eof()) break;
    var ch = peekChar();
    if (ch == '"') break;
    if (ch == '\\') throw 'Cannot handle escaped characters yet';
    s += ch;
    thePos++;
  }
  if (eof() || peekChar()  != '"') throw 'Expected <closing double quote>';
  thePos++;
  whitespace();
  return Quoted(s);
}

function term()
{
  if (eof()) throw 'Expected <expression>';
  var ch = peekChar();
  if (ch == '"')
  {
    return quoted();
  }
  else if (ch == '(')
  {
    return parenthesised();
  }
  if (ch >= '0' && ch <= '9')
  {
    return number();
  }
  if (isSymbolChar(ch))
  {
    return infix();
  }
  return name();
}

function group_right(left_op_index, right_op_index)
{
  var left_level = operator_table[left_op_index].level;
  var right_level = operator_table[right_op_index].level;
  var dir = operator_table[right_op_index].dir;
  return left_level > right_level ||
    (left_level == right_level && dir == 'right');
}

function expr()
{
  var e = term();
  var stack = [e];
  while (!closing())
  {
    var start = thePos;
    var t = term();
    var rhs;
    if (start == thePos) throw 'Should have advanced';

    if (t.infix && operator_table[t.opindex].optype == 'separator' && closing())
    {
      /* Nothing to do. Emptiness is permitted after the final separator */
    }
    else
    {
      if (t.infix)
      {
        rhs = term();
      }
      else
      {
        rhs = t;
        t = lookup_op('@');
      }

      while (stack.length > 1 && !group_right(stack[stack.length - 2].opindex, t.opindex))
      {
        var b = stack.pop();
        var op = stack.pop();
        var a = stack.pop();
        stack.push(Tree(a, op.opindex, b));
      }

      stack.push(t);
      stack.push(rhs);
    }
  }
  while (stack.length > 1)
  {
    var b = stack.pop();
    var op = stack.pop();
    var a = stack.pop();
    stack.push(Tree(a, op.opindex, b));
  }
  return stack[0];
}

function parseTop()
{
  whitespace();
  return expr();
}

function parser(str)
{
  theString = str;
  thePos = 0;
  try {
    return parseTop();
  } catch (e) {
    var line = 1;
    var character = 1;
    for (var i = 0; i < thePos; i++)
    {
      character++;
      if (theString.substr(i, 1) == '\n')
      {
        line++;
        character = 1;
      }
    }
    throw e + ' on line ' + line + ', character ' + character;
  }
}

/*
exports.parser = parser;
exports.printAST = printAST;
exports.printASTLong = printASTLong;
*/
