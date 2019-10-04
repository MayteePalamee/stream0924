/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./config/app.js":
/*!***********************!*\
  !*** ./config/app.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(__dirname) {const express = __webpack_require__(/*! express */ \"express\");\n\nconst app = express();\n\nconst io = app.io = __webpack_require__(/*! socket.io */ \"socket.io\")();\n\nconst path = __webpack_require__(/*! path */ \"path\");\n\nconst cors = __webpack_require__(/*! cors */ \"cors\");\n\nconst bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\");\n\nconst chat = __webpack_require__(/*! ../namespace */ \"./namespace.js\");\n\napp.use(cors());\napp.use(bodyParser.json());\napp.use((req, res, next) => {\n  res.header(\"Access-Control-Allow-Origin\", \"*\");\n  res.header(\"Access-Control-Allow-Headers\", \"X-Requested-With\");\n  next();\n});\napp.use(express.static(path.join(__dirname, '../dist')));\nchat.createNameSpace(io);\nmodule.exports = app;\n/* WEBPACK VAR INJECTION */}.call(this, \"/\"))\n\n//# sourceURL=webpack:///./config/app.js?");

/***/ }),

/***/ "./events/event.js":
/*!*************************!*\
  !*** ./events/event.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/**NOTE which ffmpeg */\nvar shell = __webpack_require__(/*! shelljs */ \"shelljs\");\n\nvar ffmpeg = shell.which('ffmpeg');\n\nvar util = __webpack_require__(/*! util */ \"util\");\n\nvar EventEmitter = __webpack_require__(/*! events */ \"events\").EventEmitter;\n/**#.env */\n\n\nconst dotenv = __webpack_require__(/*! dotenv */ \"dotenv\");\n\ndotenv.config();\n\nif (!ffmpeg) {\n  shell.echo('Sorry, this script requires ffmpeg');\n  shell.exit(1);\n}\n/**NOTE  */\n\n\nconst spawn = __webpack_require__(/*! child_process */ \"child_process\").spawn;\n\nvar stream = [],\n    state = [];\n\nconst onstart = (socket, namespace) => () => {\n  const room = Object.keys(socket.rooms)[1];\n  Object.keys(stream).forEach(function (id) {\n    namespace.to(room).emit('onstream', \"rtmp : \" + process.env.RTMP + id);\n    new StreamHandler(id);\n  });\n};\n\nvar StreamHandler = function (_id) {\n  var args = ['-i', '-', '-framerate', '30', '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', // video codec config: low latency, adaptive bitrate\n  '-c:a', 'aac', '-ar', '44100', '-b:a', '64k', // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits\n  '-y', //force to overwrite\n  '-use_wallclock_as_timestamps', '1', // used for audio sync\n  '-async', '1', // used for audio sync\n  //'//-filter_complex', 'aresample=44100', // resample audio to 44100Hz, needed if input is not 44100\n  '-strict', 'experimental', '-bufsize', '2000', '-f', 'flv', process.env.RTMP + _id];\n  stream[_id] = spawn('ffmpeg', args);\n  state[_id] = true;\n\n  stream[_id].on('error', function (err) {\n    console.log(err);\n    state[_id] = false;\n\n    stream[_id].stdin.end();\n\n    stream[_id].kill('SIGINT');\n  });\n\n  stream[_id].on('message', function (message) {\n    console.log(_id + ' : ' + \"ffmpeg : \", message);\n  });\n\n  stream[_id].on('close', function (code) {\n    console.log('ffmpeg exited with code ' + code);\n    state[_id] = state = false;\n  });\n\n  stream[_id].stderr.on('data', function (data) {\n    var tData = data.toString('utf8');\n    var a = tData.split('\\n');\n    console.log(_id + ' : ' + a);\n  });\n\n  stream[_id].stdout.on('data', function (data) {\n    var tLines = data.toString().split('\\n');\n    var progress = {};\n\n    for (var i = 0; i < tLines.length; i++) {\n      var key = tLines[i].split('=');\n\n      if (typeof key[0] != 'undefined' && typeof key[1] != 'undefined') {\n        progress[key[0]] = key[1];\n      }\n    } // The 'progress' variable contains a key value array of the data\n\n\n    console.log(_id + ' : ' + progress);\n  });\n};\n\nutil.inherits(StreamHandler, EventEmitter);\n\nfunction onlive(socket, data) {\n  if (state[socket.id]) {\n    stream[socket.id].stdin.write(data);\n  }\n}\n\nconst onstream = (socket, namespace) => data => {\n  onlive(socket, data);\n};\n\nconst onremote = (socket, namespace) => data => {\n  onlive(socket, data);\n};\n/** \r\n * @param {*} socket \r\n * @param {*} namespace \r\n */\n\n\nconst join = (socket, namespace) => room => {\n  socket.join(room);\n  const _id = Object.keys(socket.rooms)[1];\n  /**NOTE stream */\n\n  stream[socket.id] = null;\n  state[socket.id] = false;\n  namespace.to(_id).emit('chennel', socket.id + ' : ' + room);\n};\n\nconst exits = (socket, namespace) => room => {\n  namespace.to(room).emit('onmessage', 'user : ' + socket.id + ' exit room.');\n  socket.leave(room, () => {\n    console.log(\"exit room\");\n  });\n};\n\nconst offer = (socket, namespace) => offer => {\n  const room = Object.keys(socket.rooms)[1];\n  socket.to(room).emit('offer', offer);\n};\n\nconst candidate = (socket, namespace) => candidate => {\n  const room = Object.keys(socket.rooms)[1];\n  socket.to(room).emit('candidate', candidate);\n};\n\nconst answer = (socket, namespace) => answer => {\n  const room = Object.keys(socket.rooms)[1];\n  socket.to(room).emit('answer', answer);\n};\n\nconst onmessage = (socket, namespace) => message => {\n  const room = Object.keys(socket.rooms)[1];\n  namespace.to(room).emit('onmessage', message);\n};\n\nconst close = (socket, namespace) => message => {\n  const room = Object.keys(socket.rooms)[1];\n  namespace.to(room).emit('close', message);\n};\n\nmodule.exports = {\n  join,\n  offer,\n  exits,\n  candidate,\n  answer,\n  onmessage,\n  close,\n  onstart,\n  onstream,\n  onremote\n};\n\n//# sourceURL=webpack:///./events/event.js?");

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const http = __webpack_require__(/*! http */ \"http\");\n\nconst app = __webpack_require__(/*! ./config/app */ \"./config/app.js\");\n/**#.env */\n\n\nconst dotenv = __webpack_require__(/*! dotenv */ \"dotenv\");\n\ndotenv.config();\nconst server = http.createServer(app);\napp.io.attach(server);\napp.io.origins([\"*:*\"]);\nserver.listen(process.env.PORT, () => {\n  console.log(`Server Listening on port ${process.env.PORT}`);\n});\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./namespace.js":
/*!**********************!*\
  !*** ./namespace.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const events = __webpack_require__(/*! ./events/event */ \"./events/event.js\");\n\nconst onConnection = socket => {\n  socket.on('chennel', events.join(socket, namespace));\n  socket.on('exits', events.exits(socket, namespace));\n  socket.on('candidate', events.candidate(socket, namespace));\n  socket.on('offer', events.offer(socket, namespace));\n  socket.on('answer', events.answer(socket, namespace));\n  socket.on('close', events.close(socket, namespace));\n  socket.on('onmessage', events.onmessage(socket, namespace));\n  socket.on('onstart', events.onstart(socket, namespace));\n  socket.on('onstream', events.onstream(socket, namespace));\n  socket.on('onremote', events.onremote(socket, namespace));\n};\n\nexports.createNameSpace = io => {\n  namespace = io.on('connection', onConnection);\n  io.on('disconnect', socket => {\n    console.log(\"disconnect from cilent.\" + socket.id);\n  });\n};\n\n//# sourceURL=webpack:///./namespace.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"child_process\");\n\n//# sourceURL=webpack:///external_%22child_process%22?");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"cors\");\n\n//# sourceURL=webpack:///external_%22cors%22?");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"dotenv\");\n\n//# sourceURL=webpack:///external_%22dotenv%22?");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"events\");\n\n//# sourceURL=webpack:///external_%22events%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),

/***/ "shelljs":
/*!**************************!*\
  !*** external "shelljs" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"shelljs\");\n\n//# sourceURL=webpack:///external_%22shelljs%22?");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"socket.io\");\n\n//# sourceURL=webpack:///external_%22socket.io%22?");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"util\");\n\n//# sourceURL=webpack:///external_%22util%22?");

/***/ })

/******/ });