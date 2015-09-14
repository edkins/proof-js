var fs = require('fs');
var parse = require('./parse.js');

var str = fs.readFileSync('test.yg', {encoding:'utf8'}).toString();
var ast = parse.parser(str);

parse.printAST(ast);
