var theString = 'main = return 4';
var thePos = 0;

var Nil = {type: 'nil'};
function Unit()
{
  return {type: 'unit'};
}
function Name(n)
{
  return {type: 'name', name:n};
}
function Num(n)
{
  return {type: 'number', number:n};
}
function Cons(x, xs)
{
  return {type: 'cons', hd: x, tl: xs};
}
function Decl(n, e)
{
  return {type: 'decl', name: n, expr: e};
}
function Apply(f, x)
{
  return {type: 'apply', func: f, arg: x};
}

function ast_str(obj)
{
  if (obj.type == 'unit') return '()';
  else if (obj.type == 'name') return '`' + obj.name + '`';
  else if (obj.type == 'number') return '#' + obj.number + '#';
  else if (obj.type == 'cons') return '(' + ast_str(obj.hd) + '::' + ast_str(obj.tl) + ')';
  else if (obj.type == 'nil') return 'nil';
  else if (obj.type == 'decl') return ast_str(obj.name) + ' := ' + ast_str(obj.expr);
  else if (obj.type == 'apply') return '(' + ast_str(obj.func) + ' ' + ast_str(obj.arg) + ')';
  else return '<' + obj.type + '>';
}


function eof()
{
  return thePos == theString.length;
}

function peekChar()
{
  return theString.substr(thePos,1);
}

function whitespace()
{
  while (!eof() && peekChar() == ' ')
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
    if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9' || ch == '_')
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

function term()
{
  if (eof()) throw 'Expected <expression>';
  var ch = peekChar();
  if (ch == '(')
  {
    return parenthesised();
  }
  if (ch >= '0' && ch <= '9')
  {
    return number();
  }
  return name();
}

function expr()
{
  var e = term();
  while (!closing())
  {
    var start = thePos;
    var t = term();
    if (start == thePos) throw 'Should have advanced';
    e = Apply(e, t);
  }
  return e;
}

function decl()
{
  var n = name();
  symbol('=');
  var e = expr();
  return Decl(n, e);
}

function decls()
{
  if (eof())
    return Nil;
  else
  {
    var d = decl();
    var ds = decls();
    return Cons(d, ds);
  }
}

function parseTop()
{
  whitespace();
  return decls();
}

function main()
{
  try {
    var ast = parseTop();
    console.log(ast_str(ast));
  } catch (e) {
    console.log(e + ' at position ' + thePos);
  }
}

main();

