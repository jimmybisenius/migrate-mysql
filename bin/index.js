#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// Require third-party dependencies
var fs = require("fs");
var mysql = require("mysql2/promise");
var util = require('util');
var readDir = util.promisify(fs.readdir);
var readFile = function (fileName) { return util.promisify(fs.readFile)(fileName, 'utf8'); };
console.clear();
console.log('Starting Migrate MySQL...');
(function () { return __awaiter(_this, void 0, void 0, function () {
    var connection, existingMigrations, latestMigration, i, dash, currentMigration, localMigrations, newestMigration, i, dash, currentMigration, i, desiredMigration, i2, dash, currentMigration, query;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, mysql.createConnection((_a = process.env.DB_URL) !== null && _a !== void 0 ? _a : {
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASS || 'single-my-links',
                    host: process.env.DB_HOST || 'localhost',
                    port: Number(process.env.DB_PORT) || 3306,
                    database: process.env.DB_DATABASE || 'singlelink'
                })
                // Checks for existing migrations table. If this does not exist, it creates one
            ];
            case 1:
                connection = _b.sent();
                // Checks for existing migrations table. If this does not exist, it creates one
                console.log('Checking for migrations table');
                return [4 /*yield*/, connection.execute("\n        create table if not exists migrations (\n            id int NOT NULL AUTO_INCREMENT PRIMARY KEY,\n            filename varchar(255) not null,\n            created_at timestamp default current_timestamp not null,\n            UNIQUE (filename)\n        );\n    ")];
            case 2:
                _b.sent();
                console.log('Migrations table present/created');
                // TODO: Error handling for create migrations table
                // Runs select * from migrations to get a list of already run migrations.
                console.log('Fetching existing migrations');
                return [4 /*yield*/, connection.execute("\n        select * from migrations;\n    ")];
            case 3:
                existingMigrations = (_b.sent())[0];
                latestMigration = 0;
                for (i = 0; i < existingMigrations.length; i++) {
                    dash = existingMigrations[i].filename.indexOf('-');
                    currentMigration = Number(existingMigrations[i].filename.substring(0, dash));
                    if (!latestMigration || latestMigration < currentMigration)
                        latestMigration = currentMigration;
                }
                // Pulls the local migrations from /migrations
                console.log('Fetching new migrations');
                return [4 /*yield*/, readDir('./migrations')];
            case 4:
                localMigrations = _b.sent();
                newestMigration = undefined;
                for (i = 0; i < localMigrations.length; i++) {
                    dash = localMigrations[i].indexOf('-');
                    currentMigration = Number(localMigrations[i].substring(0, dash));
                    if (!newestMigration || newestMigration < currentMigration)
                        newestMigration = currentMigration;
                }
                // Compares the results from step #4 & #5, pruning already run migrations from the local migrations list to build a list of migrations to be performed
                if (!newestMigration)
                    throw Error('Uh oh! We couldn\'t find your migrations folder. Check again?');
                if (!(newestMigration > latestMigration)) return [3 /*break*/, 11];
                console.log('New migrations found. Running migrations...');
                i = latestMigration + 1;
                _b.label = 5;
            case 5:
                if (!(i <= newestMigration)) return [3 /*break*/, 10];
                desiredMigration = void 0;
                for (i2 = 0; i2 < localMigrations.length; i2++) {
                    dash = localMigrations[i2].indexOf('-');
                    currentMigration = Number(localMigrations[i2].substring(0, dash));
                    // If current file is the desired migration
                    if (currentMigration === i) {
                        // Save desired migration
                        desiredMigration = localMigrations[i2];
                        // After, end for loop
                        break;
                    }
                }
                return [4 /*yield*/, readFile("./migrations/".concat(desiredMigration))];
            case 6:
                query = _b.sent();
                return [4 /*yield*/, connection.execute(query)
                    // Add migration to migrations table
                ];
            case 7:
                _b.sent();
                // Add migration to migrations table
                return [4 /*yield*/, connection.execute("\n                insert into migrations (\n                    filename\n                ) values (?)\n            ", [desiredMigration])];
            case 8:
                // Add migration to migrations table
                _b.sent();
                console.log("Migration completed ".concat(desiredMigration, " \u2705"));
                _b.label = 9;
            case 9:
                i++;
                return [3 /*break*/, 5];
            case 10: return [3 /*break*/, 12];
            case 11:
                console.log('No new migrations have been found. Exiting.');
                _b.label = 12;
            case 12:
                // For each migration in said list...
                // Run the migration against the database
                // Adds a record with the given filename and time performed to migrations
                connection.end();
                console.log('Migrations have finished... Goodbye!');
                return [2 /*return*/];
        }
    });
}); })();
