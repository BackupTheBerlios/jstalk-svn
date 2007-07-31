$Token = function(id, lexeme, line) {
  this.id = id || '#noid'//$Lexer.T_STRING
  this.lexeme = lexeme
  this.line = line || null
}


/****************************************************
  $Lexer
***************************************************/



$Lexer = function(filepath) {
  this.filepath = filepath
  this.idx = 0
  this.last_token = null
  this.current_line = 1
//   this.white_space = ''
}

$lexp = $Lexer.prototype;

$lexp.loadStream = function() {
  this.stream = new java.io.BufferedReader(new java.io.FileReader(this.filepath));

  this.txt = ''
  var c
  while ((c = this.stream.read()) != -1) {
    this.txt += String.fromCharCode(c)
  }
}

$lexp.getToken = function() {
  var f_tokens = [$Lexer.T_ID,
                  $Lexer.T_EOF,
                  $Lexer.T_COLON,
                  $Lexer.T_NAME,
                  $Lexer.T_SUPER_CLASS,
                  $Lexer.T_SPACE,
                  $Lexer.T_ATTRIBUTES,
                  $Lexer.T_CLASS_ATTRIBUTES,
                  $Lexer.T_DOC,
                  $Lexer.T_FUNCTION,
                  $Lexer.T_STRING,
                  $Lexer.T_IMETHOD_SEP,
                  $Lexer.T_CMETHOD_SEP,
                  $Lexer.T_OPEN_PAREN,
                  $Lexer.T_CLOSE_PAREN,
                  $Lexer.T_OPEN_BRK,
                  $Lexer.T_CLOSE_BRK,
                  $Lexer.T_OPEN_SBRK,
                  $Lexer.T_CLOSE_SBRK,
                  $Lexer.T_COMMA,
                  $Lexer.T_IGNORE]


  var keywords = [$Lexer.T_NAME,
                  $Lexer.T_SUPER_CLASS,
                  $Lexer.T_SPACE,
                  $Lexer.T_ATTRIBUTES,
                  $Lexer.T_CLASS_ATTRIBUTES,
                  $Lexer.T_DOC,
                  $Lexer.T_FUNCTION]

  $Lexer.T_WS.call(this)

  for (var i = 0; i < f_tokens.length; i++) {
    if (f_tokens[i].call(this)) {
//       print("MATCHED " + f_tokens[i].tname + " " + this.current_line + "\n")
      break;
    } /*else {
      print("** no match with: " + f_tokens[i].tname + " for: " + this.txt.substr(this.idx, 4) + "\n")
    }*/
  }

  if (this.last_token.id == $Lexer.T_ID) {
    for (var i = 0; i < keywords.length; i++) {
      if (this.last_token.lexeme == keywords[i].key) {
        this.last_token.id = keywords[i]
      }
    }
  }
  return this.last_token
}

$lexp.matchLexeme = function(str, skipUpdateIdx) {
  //match EOF
  if (str == -1) {
    if (this.idx == this.txt.length) {
      return true
    } else {
      return false
    }
  } else if ((this.idx + str.length) > this.txt.length) {
    return false
  }

//   puts("trying (" + str + ") on " + this.idx + ", wich is [" + this.txt.substring(this.idx, this.idx + str.length)  + "]")
  var ret = this.txt.substr(this.idx, str.length) == str
  if (ret && !skipUpdateIdx) {
    this.idx += str.length
  }
  return ret
}

$lexp.matchNotLexema = function(str) {
  if ((this.idx + str.length) > this.txt.length) {
    return false
  }

  var ret = !this.matchLexeme(str, true)
  if (ret) {
    this.idx += str.length
  }
  return ret
}

$lexp.matchManyOf = function(set) {
  var ret = false
  var it
  do {
    it = false
    for (var i = 0; i < set.length; i++) {
      if (this.matchLexeme(set[i])) {
        ret = true
        it = true
      }
    }
  } while(it)


  return ret
}

$lexp.matchAnyOf = function(set) {
  var ret = false
  for (var i = 0; i < set.length; i++) {
    if (this.matchLexeme(set[i])) {
      ret = true
    }
  }
  return ret
}



/*********** $Tokens ****************/

$Lexer.T_IGNORE = function() {
  var c = this.txt[this.idx]
  //match itself (aways true, as long as there is text left to consume)
  this.matchLexeme(this.txt[this.idx])
  this.last_token = new $Token(arguments.callee, c, this.current_line)
  return true
}

$Lexer.T_WS = function() {
  //(' '| "\t" | "\n")*

//   var backup = this.idx
  var had = false
  var found
  do {
    found = false
    if (this.matchLexeme("\n")) {
      this.current_line++
      found = true
    } else {
      found = this.matchManyOf([" ", "\t"])
    }
    if (found) had = true
  } while(found)

//   if (had) {
//     this.white_space = this.txt.substring(backup, this.idx)
//   } else {
//     this.white_space = ''
//   }
  return had
}
$Lexer.T_WS.tname = "T_WS"

$Lexer.T_EOF = function() {
  if (this.matchLexeme(-1)) {
    this.last_token = new $Token(arguments.callee, null, this.current_line)
    return true
  }
  return false
}
$Lexer.T_EOF.tname = "T_EOF"

$Lexer.T_COLON = function() {
  if (this.matchLexeme(':')) {
    this.last_token = new $Token(arguments.callee, ':', this.current_line)
    return true
  }
  return false
}
$Lexer.T_COLON.tname = "T_COLON"

$Lexer.T_ID = function() {
  // T_LETTER (T_LETTER|T_NUM|_|$)*
  var cidx = this.idx

  var alfa = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
              'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
              'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
              'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_', '$' ]

  var num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  var ret
  ret = this.matchAnyOf(alfa)
  while (ret && (this.matchManyOf(alfa) || this.matchManyOf(num)));

  if (ret) {
    this.last_token = new $Token(arguments.callee, this.txt.substring(cidx, this.idx), this.current_line)
  }

  return ret
}
$Lexer.T_ID.tname = "T_ID"

$Lexer.T_NAME = function() {
  var ret = this.matchLexeme($Lexer.T_NAME.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'name', this.current_line)
  }
  return ret
}
$Lexer.T_NAME.tname = "T_NAME"
$Lexer.T_NAME.key = "name"

$Lexer.T_SUPER_CLASS = function() {
  var ret = this.matchLexeme($Lexer.T_SUPER_CLASS.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'superclass', this.current_line)
  }
  return ret
}
$Lexer.T_SUPER_CLASS.tname = "T_SUPER_CLASS"
$Lexer.T_SUPER_CLASS.key = "superclass"

$Lexer.T_SPACE = function() {
  var ret = this.matchLexeme($Lexer.T_SPACE.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'space', this.current_line)
  }
  return ret
}
$Lexer.T_SPACE.tname = "T_SPACE"
$Lexer.T_SPACE.key = "space"

$Lexer.T_ATTRIBUTES = function() {
  var ret = this.matchLexeme($Lexer.T_ATTRIBUTES.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'attributes', this.current_line)
  }
  return ret
}
$Lexer.T_ATTRIBUTES.tname = "T_ATTRIBUTES"
$Lexer.T_ATTRIBUTES.key = "attributes"

$Lexer.T_CLASS_ATTRIBUTES = function() {
  var ret = this.matchLexeme($Lexer.T_CLASS_ATTRIBUTES.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'class_attributes', this.current_line)
  }
  return ret
}
$Lexer.T_CLASS_ATTRIBUTES.tname = "T_CLASS_ATTRIBUTES"
$Lexer.T_CLASS_ATTRIBUTES.key = "class_attributes"

$Lexer.T_DOC = function() {
  var ret = this.matchLexeme($Lexer.T_DOC.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'doc', this.current_line)
  }
  return ret
}
$Lexer.T_DOC.tname = "T_DOC"
$Lexer.T_DOC.key = "doc"

$Lexer.T_STRING = function() {
  // " (^"| \")* "


  var ret
  ret = this.matchLexeme("\"")
  var cidx = this.idx

  if (!ret) {
    return false
  }


  var it = true
  while (it) {
    it = this.matchLexeme("\\\"")
    if (this.matchLexeme("\n")) {
      it = true
      this.current_line++
    }
    it = it || this.matchNotLexema("\"");
  }

  var end = this.idx
  ret = this.matchLexeme("\"")

  if (ret) {
    this.last_token = new $Token(arguments.callee, this.txt.substring(cidx, end), this.current_line)
  }

  return ret
}
$Lexer.T_STRING.tname = "T_STRING"

$Lexer.T_IMETHOD_SEP = function() {
  var ret = this.matchLexeme("#")
  if (ret) {
    this.last_token = new $Token(arguments.callee, '#', this.current_line)
  }
  return ret
}
$Lexer.T_IMETHOD_SEP.tname = "T_IMETHOD_SEP"

$Lexer.T_CMETHOD_SEP = function() {
  var ret = this.matchLexeme(">>")
  if (ret) {
    this.last_token = new $Token(arguments.callee, '>>', this.current_line)
  }
  return ret
}
$Lexer.T_CMETHOD_SEP.tname = "T_CMETHOD_SEP"

$Lexer.T_FUNCTION = function() {
  var ret = this.matchLexeme($Lexer.T_FUNCTION.key)
  if (ret) {
    this.last_token = new $Token(arguments.callee, 'function', this.current_line)
  }
  return ret
}
$Lexer.T_FUNCTION.tname = "T_FUNCTION"
$Lexer.T_FUNCTION.key = "function"

$Lexer.T_OPEN_PAREN = function() {
  var what = "("
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_OPEN_PAREN.tname = "T_OPEN_PAREN"

$Lexer.T_CLOSE_PAREN = function() {
  var what = ")"
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_CLOSE_PAREN.tname = "T_CLOSE_PAREN"

$Lexer.T_OPEN_BRK = function() {
  var what = "{"
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_OPEN_BRK.tname = "T_OPEN_BRK"

$Lexer.T_CLOSE_BRK = function() {
  var what = "}"
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_CLOSE_BRK.tname = "T_CLOSE_BRK"

$Lexer.T_OPEN_SBRK = function() {
  var what = "["
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_OPEN_SBRK.tname = "T_OPEN_SBRK"

$Lexer.T_CLOSE_SBRK = function() {
  var what = "]"
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_CLOSE_SBRK.tname = "T_CLOSE_SBRK"

$Lexer.T_COMMA = function() {
  var what = ","
  var ret = this.matchLexeme(what)
  if (ret) {
    this.last_token = new $Token(arguments.callee, what, this.current_line)
  }
  return ret
}
$Lexer.T_COMMA.tname = "T_COMMA"


//private token ids to build the AST
$Lexer.CLASS_METHODS    = function() {}
$Lexer.CLASS_METHODS.tname = 'CLASS_METHODS'
$Lexer.INSTANCE_METHODS = function() {}
$Lexer.INSTANCE_METHODS.tname = 'INSTANCE_METHODS'

//all tokens that are valid T_IDS
$Lexer.VALID_IDS = [$Lexer.T_NAME,
                    $Lexer.T_SUPER_CLASS,
                    $Lexer.T_SPACE,
                    $Lexer.T_ATTRIBUTES,
                    $Lexer.T_CLASS_ATTRIBUTES,
                    $Lexer.T_DOC,
                    $Lexer.T_FUNCTION,
                    $Lexer.T_ID]






//======================= Parser ============================



$ClassDecl = function() {
  this.name = null
  this.superclass = null
  this.space = null
  this.attributes = []
  this.class_attributes = []
  this.methods = [] //{name: 'f', body: 'function(){}'}
  this.doc = ''

  this.class_methods = []
  this.methods = []
}


//exceptions
$TokenExpected = {}
$TokenExpected.raise = function(idexpected, token, line, path) {
  throw "JSTalk Parser: Expected " + idexpected.tname + ", found " + token.id.tname +
      " ( '" + token.lexeme + "' ) at line " + line + " [" + path + "]"
}

//node
// Node = function(token, label) {}

$Parser = function(lexer) {
  this.lexer = lexer
  this.la = new $Token
  this.last_token = null

  this.lexer.loadStream()
}

$pps = $Parser.prototype

$pps._matchToken = function(tokenid, silent) {
  if (this.la.id != tokenid) {
    ret = false
  } else {
    this._consumeToken()
    ret = true
  }

  if (!ret && !silent) {
    $TokenExpected.raise(tokenid, this.la, this.la.line, this.lexer.filepath)
  }

  return ret
}

$pps._matchIDTokens = function(tokens, silent) {
  for (var i = 0; i < tokens.length; i++) {
    if (this._matchToken(tokens[i], true)) {
      return true
    }
  }

  if (silent) {
    return false
  } else {
    $TokenExpected.raise($Lexer.T_ID, this.la, this.la.line)
  }
}

$pps._consumeToken = function() {
  this.last_token = this.la
  this.la = this.lexer.getToken()
}


//productions

$pps.jst_class = function() {
  //jst_class ::= header_decl method_decl T_EOF

  var klass = new $ClassDecl

  this._consumeToken()

  this.header_decl(klass)
  this.method_decl(klass)
  this._matchToken($Lexer.T_EOF)
  return klass
}

$pps.header_decl = function(klass) {
/*
  header_decl ::= T_NAME T_COLON T_ID
                  T_SUPERCLASS T_COLON T_ID
                  T_SPACE T_COLON T_ID
                  T_ATTRIBUTES T_COLON T_OPEN_SBRK var_list T_CLOSE_SBRK
                  T_CLASS_ATTRIBUTES T_COLON T_OPEN_SBRK var_list T_CLOSE_SBRK
                  T_DOC T_COLON T_STRING

*/
  //name
  this._matchToken($Lexer.T_NAME)
  this._matchToken($Lexer.T_COLON)
  this._matchIDTokens($Lexer.VALID_IDS)
  klass.name = this.last_token.lexeme

  //superclass
  this._matchToken($Lexer.T_SUPER_CLASS)
  this._matchToken($Lexer.T_COLON)
  this._matchIDTokens($Lexer.VALID_IDS)
  klass.superclass = this.last_token.lexeme

  //space
  this._matchToken($Lexer.T_SPACE)
  this._matchToken($Lexer.T_COLON)
  this._matchIDTokens($Lexer.VALID_IDS)
  klass.space = this.last_token.lexeme

  //attributes
  this._matchToken($Lexer.T_ATTRIBUTES)
  this._matchToken($Lexer.T_COLON)
  this._matchToken($Lexer.T_OPEN_SBRK)
  this.var_list(klass.attributes)
  this._matchToken($Lexer.T_CLOSE_SBRK)

  //class_attributes
  this._matchToken($Lexer.T_CLASS_ATTRIBUTES)
  this._matchToken($Lexer.T_COLON)
  this._matchToken($Lexer.T_OPEN_SBRK)
  this.var_list(klass.class_attributes)
  this._matchToken($Lexer.T_CLOSE_SBRK)

  //doc
  this._matchToken($Lexer.T_DOC)
  this._matchToken($Lexer.T_COLON)
  this._matchToken($Lexer.T_STRING)
  klass.doc = this.last_token.lexeme
}

$pps.var_list = function(list) {
//  var_list ::= T_ID (T_COMMA T_ID)*
//               | e

  if (this._matchIDTokens($Lexer.VALID_IDS, true)) {
    list.push(this.last_token.lexeme)
    while (this._matchToken($Lexer.T_COMMA, true)) {
      this._matchIDTokens($Lexer.VALID_IDS)
      list.push(this.last_token.lexeme)
    }
  }
}

$pps.method_decl = function(klass) {
  //method_decl ::= class_methods instance_methods

  this.methods(klass.class_methods, $Lexer.T_CMETHOD_SEP)
  this.methods(klass.methods, $Lexer.T_IMETHOD_SEP)
}

$pps.methods = function(list, idsymb) {
/*
class_methods ::= (T_CMETHOD_SEP T_ID T_COLON T_FUNCTION
                    T_OPEN_PAR var_list T_CLOSE_PAR T_OPEN_BRK
                    fbody T_CLOSE_BRK)*
               | e

instance_methods ::= (T_CMETHOD_SEP T_ID T_COLON T_FUNCTION
                    T_OPEN_PAR var_list T_CLOSE_PAR T_OPEN_BRK
                    fbody T_CLOSE_BRK)*
               | e

*/

  //(class_methods (class_f "function(x, y, z) {}") (...))
  var fname

  var args
  var bodylist
  var str
  while (true) {
    if (!this._matchToken(idsymb, true)) {
      return
    }

    str = 'function('
    this._matchIDTokens($Lexer.VALID_IDS)
    fname = this.last_token.lexeme
    this._matchToken($Lexer.T_COLON)
    this._matchToken($Lexer.T_FUNCTION)

    //ignore the name of the func [function anonymous() {}]
    this._matchIDTokens($Lexer.VALID_IDS, true)

    this._matchToken($Lexer.T_OPEN_PAREN)
    args = []
    this.var_list(args)
    str += args.join(",") + ") {"
    this._matchToken($Lexer.T_CLOSE_PAREN)
    var idx = this.lexer.idx
    this._matchToken($Lexer.T_OPEN_BRK)
    str += this.fbody(idx) + "\n}"
    this._matchToken($Lexer.T_CLOSE_BRK)

    list.push({name:fname, body:str})
  }
}

$pps.fbody = function(idx) {
/*
  fbody ::= (~(T_CLOSE_BRACKET | T_OPEN_BRACKET)
              | T_OPEN_BRACKET (fbody)* T_CLOSE_BRACKET)*
*/

  var end = -1
  var str = ''
  var found
  do {
    found = false

    //iterate instead of recurse
    if ((this.la.id != $Lexer.T_OPEN_BRK) && (this.la.id != $Lexer.T_CLOSE_BRK) && (this.la.id != $Lexer.T_EOF)) {
      end = this.lexer.idx
      this._consumeToken()
      found = true
    } else if (this.la.id == $Lexer.T_OPEN_BRK) {
      this._matchToken($Lexer.T_OPEN_BRK)
      this.fbody(-1)
      end = this.lexer.idx
      this._matchToken($Lexer.T_CLOSE_BRK)
      found = true
    }
  } while(found)

  if (idx != -1 && end != -1) {
    return this.lexer.txt.substring(idx, end)
  } else {
    return ''
  }
}




//               Class Loader
//============================================



$ClassLoader = {}

$ClassLoader.load = function(className, preventRegister) {
  print('loading ' + className + " ...\n")

  var parser = new $Parser(new $Lexer(className + '.jst'))
  var cdecl = parser.jst_class()
 
  var klass
  if (className == 'JSObject') {
    klass = $ClassLoader.loadJSObject(cdecl)    
  } else {
    klass = $ClassLoader.loadOther(cdecl, preventRegister)
  }
 
//  if (klass.initialize) {
//    klass.initialize()
//  }
}

$ClassLoader.loadJSObject = function(cdecl) {
  var classMethods = {}
  var instanceMethods = {}
  for (var i = 0; i < cdecl.class_methods.length; i++) {
    classMethods[cdecl.class_methods[i].name] = cdecl.class_methods[i].body
  }

  for (var i = 0; i < cdecl.methods.length; i++) {
    instanceMethods[cdecl.methods[i].name] = cdecl.methods[i].body
  }

  return $ClassLoader.setupJSObject(cdecl, classMethods, instanceMethods)
}

$ClassLoader.setupJSObject = function(cdecl, classMethods, instanceMethods) {
  var JSObjectClass = new Function
  JSObject = new JSObjectClass

  var pklass = JSObjectClass.prototype
  var ctor   = JSObjectClass
  var klass  = JSObject

  //temporary mixin to create the bootstrap methods/attributes:
  //attributes(), methods(), registerClassMember() etc

  pklass.attributes             = (new Function('return (' + classMethods.attributes + ')'))()
  pklass.methods                = (new Function('return (' + classMethods.methods + ')'))()
  pklass.registerClassAttribute = (new Function('return (' + classMethods.registerClassAttribute + ')'))()
  pklass.registerClassMethod    = (new Function('return (' + classMethods.registerClassMethod + ')'))()
  pklass.initClassRegistry      = (new Function('return (' + classMethods.initClassRegistry + ')'))()

  pklass._ctor = ctor

  //initialize ._attributes and ._methods
  pklass.initClassRegistry()

  //registering and defining class methods
  var keys = classMethods.keys()
  for (var i = 0; i < keys.length; i++) {
    pklass.registerClassMethod(keys[i], classMethods[keys[i]])
  }

  var proto = new Function

  //registering and defining class attributes (except ._attributes and ._methods)
  pklass.initMeta({
      name: 'JSObject',
      superclass: Object,
      klass: klass,
      ctor: ctor,
      template: null,
      doc: 'Primordial object class',
      proto: proto,
      instanceAttributes: new Array,
      instanceMethods: new Array,
      ownedClasses: new Array
  })
  //setting up primordial proto object (prototipal instance). default members: only klass/_klass

  proto.prototype._klass = klass
  pklass.registerAttribute('klass')

  keys = instanceMethods.keys()
  for (var i = 0; i < keys.length; i++) {
    pklass.registerMethod(keys[i], instanceMethods[keys[i]])
  }
  return klass
}

$ClassLoader.loadOther = function(cdecl, preventRegister) {
  var str = cdecl.superclass + ".subclass({\n"

  str += "name: '"  + cdecl.name  + "',\n"

  var space
  if (cdecl.space != 'null') {
    space = $global[cdecl.space]
    str += "space: " + cdecl.space + ",\n"
  }
  str += "doc: "   + cdecl.doc.rep()   + ",\n"

  str += "class_attributes: ["
  for (var i = 0; i < cdecl.class_attributes.length; i++) {
    str += "'" + cdecl.class_attributes[i] + "',"
  }
  str += "],\n"
  str += "attributes: ["
  for (var i = 0; i < cdecl.attributes.length; i++) {
    str += "'" + cdecl.attributes[i] + "',"
  }
  str += "],\n"
  str += "}, " + (preventRegister?'true':'false') + ")"
  eval(str)

  var klass = space?space[cdecl.name]:$global[cdecl.name]

  var methods = cdecl.class_methods
  if (methods) {
    for (var i = 0; i < methods.length; i++) {
      klass.registerClassMethod(methods[i].name, methods[i].body)
    }
  }

  methods = cdecl.methods
  if (methods) {
    for (var i = 0; i < methods.length; i++) {
      klass.registerMethod(methods[i].name, methods[i].body)
    }
  }
  return klass
}
