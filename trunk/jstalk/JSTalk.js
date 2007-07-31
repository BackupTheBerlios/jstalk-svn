load("core_extensions.js")
load("core_loader.js")

/* Basic JSTalk */
$ClassLoader.load('JSObject')
$ClassLoader.load('System', true)
$ClassLoader.load('SystemDictionary', true)
System.boot()
