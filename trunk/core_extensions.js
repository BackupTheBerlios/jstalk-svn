$global = this
pkg = Packages

function puts(str) {
  if (this.print) {
    print(str + "\n")
  } else {
    alert(str + "\n")
  }
}

//basics
Object.prototype.klass        = function() { return Object }
Object.prototype.methods      = function() {return []}
Object.prototype.attributes   = function() {return []}
Object.prototype.isClass      = function() {return false}

//Object specifics
Object.superclass             = function() { return null }

//Function.name, Object.name, etc are read only =(
//So we have to use other prop, like 'className'
Object.className              = function() { return this.name }
Object.proto                  = function() { return Object.prototype }
Object.isClass                = function() {return true}
Object.instanceMethods        = function() {return []}
Object.instanceAttributes     = function() {return []}

// Object.instanceAttributes     = function() { return [] }
// Object.instanceMethods        = function() { return [] }


/* Features */

//since the above additions creates a problem
//when using {key:value} literals for hashes (ie. 'superclass', 'klass', etc will appear as keys)
//we need to provide a way to cleaningly use {} as hashes again
Object.prototype.each = function(func) {
  for (var m in this) {
    if (this[m] !== Object[m] && this[m] !== Object.prototype[m]) {
      func(m, this[m])
    }
  }
}

Object.prototype.keys = function() {
  var keys = new Array
  for (var m in this) {
    if (this[m] !== Object[m] && this[m] !== Object.prototype[m]) {
      keys.push(m)
    }
  }
  return keys
}


// Object.prototype.hasProperty = function(prop) {
//   var found = false
//   for (var m in this) {
//     if (prop == m) {
//       found = true
//       break
//     }
//   }
//   return found
// }


/**
  String
**/

String.superclass             = function() { return Object }
String.className              = function() { return this.name }
String.klass                  = function() { return String }

String.prototype.rep = function() {
  var str = '"' + this.replace(new RegExp('"', 'g'), "'") + '"';
  return str.replace(new RegExp("\n", 'g'), "\\n")
}


/*
String.prototype.esc = function() {
  var str = this.replace(new RegExp("'", 'g'), "\\'")
  return str.replace(new RegExp("\"", 'g'), "\\\"")
}*/

/* Array */

Array.superclass             = function() { return Object }
Array.className              = function() { return this.name }
Array.klass                  = function() { return Array }

Array.prototype.pushUnique = function(element) {
  var found = false
  for (var i = 0; i < this.length; i++) {
    if (element == this[i]) {
      found = true
      break
    }
  }
  if (!found) {
    this.push(element)
  }
}

Array.prototype.remove = function(value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == value) {
      this.splice(i,1)
    }
  }
}

Array.prototype.diff = function(arr) {
  var ret = {added:[], removed:[]}

  var found = false
  for (var i = 0; i < this.length; i++) {
    for (var j = 0; j < arr.length; j++) {
      if (this[i] == arr[j]) {
        found = true
        break
      }
    }
    if (!found) {
      ret.removed.push(this[i])
    }
    found = false
  }

  found = false
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < this.length; j++) {
      if (this[j] == arr[i]) {
        found = true
        break
      }
    }
    if (!found) {
      ret.added.push(arr[i])
    }
    found = false
  }
  return ret
}

Array.prototype.each = function(func) {
  for (var i = 0; i < this.length; i++) {
    func(this[i], i)
  }
}

Array.prototype.exists = function(value) {
  for (var i = 0; i < this.length; i++) {
    if (value == this[i]) {
      return true
    }
  }
  return false
}

Function.prototype.toSource = function() {
  if (this._source) {
    return this._source
  } else {
    return this.toString()
  }
}