var authProxy = require('./index');
var config = require('./config');

authProxy(config).listen(8081);