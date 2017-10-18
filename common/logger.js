var log4js = require('log4js');
log4js.configure({
    appenders: [
        {"type": "console", "category": "console"},
        {
            "type": "dateFile",                 // 日志文件类型，可以使用日期作为文件名的占位符.
            "filename": "./logs/",              // 日志文件名，可以设置相对路径或绝对路径.
            "pattern": "yyyyMMdd.log",          // 占位符，紧跟在filename后面
            "absolute": false,                  // filename是否绝对路径
            "alwaysIncludePattern": true,       // 文件名是否始终包含占位符
            "category": "console"               // 记录器名
        },
        // 定义一个日志记录器
        {
            "type": "dateFile",                 // 日志文件类型，可以使用日期作为文件名的占位符.
            "filename": "./logs/sku/",         // 日志文件名，可以设置相对路径或绝对路径.
            "pattern": "yyyyMMdd.log",          // 占位符，紧跟在filename后面
            "absolute": false,                  // filename是否绝对路径
            "alwaysIncludePattern": true,       // 文件名是否始终包含占位符
            "category": "sku"                  // 记录器名
        },
        {
            "type": "dateFile",                 // 日志文件类型，可以使用日期作为文件名的占位符.
            "filename": "./logs/store/",         // 日志文件名，可以设置相对路径或绝对路径.
            "pattern": "yyyyMMdd.log",          // 占位符，紧跟在filename后面
            "absolute": false,                  // filename是否绝对路径
            "alwaysIncludePattern": true,       // 文件名是否始终包含占位符
            "category": "store"                  // 记录器名
        },
        {
            "type": "dateFile",                 // 日志文件类型，可以使用日期作为文件名的占位符.
            "filename": "./logs/tcp/",         // 日志文件名，可以设置相对路径或绝对路径.
            "pattern": "yyyyMMdd.log",          // 占位符，紧跟在filename后面
            "absolute": false,                  // filename是否绝对路径
            "alwaysIncludePattern": true,       // 文件名是否始终包含占位符
            "category": "tcp"                  // 记录器名
        }
    ],
    "levels": {
        "console": "TRACE",
        "socket": "TRACE",
    },
    // 设置记录器的默认显示级别，低于这个级别的日志，不会输出
    replaceConsole: true
});

var m = {};

m.sku    = log4js.getLogger('sku');
m.store  = log4js.getLogger('store');
m.tcp    = log4js.getLogger('tcp');



module.exports = exports = m;