"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/upload/route";
exports.ids = ["app/api/upload/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "./action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fhunxai%2Fapkapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fhunxai%2Fapkapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fhunxai%2Fapkapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fhunxai%2Fapkapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_hunxai_apkapp_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/upload/route.ts */ \"(rsc)/./app/api/upload/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/upload/route\",\n        pathname: \"/api/upload\",\n        filename: \"route\",\n        bundlePath: \"app/api/upload/route\"\n    },\n    resolvedPagePath: \"/Users/hunxai/apkapp/app/api/upload/route.ts\",\n    nextConfigOutput,\n    userland: _Users_hunxai_apkapp_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/upload/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1cGxvYWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmh1bnhhaSUyRmFwa2FwcCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZodW54YWklMkZhcGthcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ0o7QUFDekU7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ibG9nLWNtcy8/MGNkZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvaHVueGFpL2Fwa2FwcC9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdXBsb2FkL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvdXBsb2FkXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS91cGxvYWQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvaHVueGFpL2Fwa2FwcC9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvdXBsb2FkL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fhunxai%2Fapkapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fhunxai%2Fapkapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/upload/route.ts":
/*!*********************************!*\
  !*** ./app/api/upload/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_api_security__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/api-security */ \"(rsc)/./lib/api-security.ts\");\n\n\n\nasync function POST(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_0__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n    if (!session || session.user.role !== \"admin\") {\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            error: \"Unauthorized\"\n        }, 401);\n    }\n    // Check if Cloudinary is configured\n    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/^[\"']|[\"']$/g, \"\");\n    const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^[\"']|[\"']$/g, \"\");\n    const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^[\"']|[\"']$/g, \"\");\n    if (!cloudName || !apiKey || !apiSecret) {\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            error: \"Cloudinary is not configured\"\n        }, 500);\n    }\n    // Configure Cloudinary\n    const { v2: cloudinaryUploader } = __webpack_require__(/*! cloudinary */ \"(rsc)/./node_modules/cloudinary/cloudinary.js\");\n    cloudinaryUploader.config({\n        cloud_name: cloudName,\n        api_key: apiKey,\n        api_secret: apiSecret,\n        secure: true\n    });\n    try {\n        const formData = await req.formData();\n        const file = formData.get(\"file\");\n        if (!file) {\n            return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n                error: \"No file provided\"\n            }, 400);\n        }\n        // Validate file type\n        const allowedTypes = [\n            \"image/jpeg\",\n            \"image/jpg\",\n            \"image/png\",\n            \"image/gif\",\n            \"image/webp\"\n        ];\n        if (!allowedTypes.includes(file.type)) {\n            return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n                error: \"Invalid file type. Only images are allowed.\"\n            }, 400);\n        }\n        // Validate file size (max 10MB for Cloudinary free tier)\n        const maxSize = 10 * 1024 * 1024; // 10MB\n        if (file.size > maxSize) {\n            return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n                error: \"File size exceeds 10MB limit\"\n            }, 400);\n        }\n        // Convert file to buffer for upload\n        const bytes = await file.arrayBuffer();\n        const buffer = Buffer.from(bytes);\n        // Upload to Cloudinary\n        const result = await cloudinaryUploader.uploader.upload(`data:${file.type};base64,${buffer.toString(\"base64\")}`, {\n            folder: \"apkapp\",\n            resource_type: \"auto\",\n            transformation: [\n                {\n                    quality: \"auto:good\",\n                    fetch_format: \"auto\"\n                }\n            ]\n        });\n        // Return the secure URL with security headers\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            url: result.secure_url,\n            publicId: result.public_id,\n            width: result.width,\n            height: result.height\n        });\n    } catch (error) {\n        console.error(\"Upload error:\", error);\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            error: error.message || \"Failed to upload file\"\n        }, error.http_code || 500);\n    }\n}\n// Optional: Add DELETE endpoint to remove images from Cloudinary\nasync function DELETE(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_0__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n    if (!session || session.user.role !== \"admin\") {\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            error: \"Unauthorized\"\n        }, 401);\n    }\n    // Configure Cloudinary\n    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/^[\"']|[\"']$/g, \"\");\n    const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^[\"']|[\"']$/g, \"\");\n    const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^[\"']|[\"']$/g, \"\");\n    if (!cloudName || !apiKey || !apiSecret) {\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            error: \"Cloudinary is not configured\"\n        }, 500);\n    }\n    const { v2: cloudinaryDelete } = __webpack_require__(/*! cloudinary */ \"(rsc)/./node_modules/cloudinary/cloudinary.js\");\n    cloudinaryDelete.config({\n        cloud_name: cloudName,\n        api_key: apiKey,\n        api_secret: apiSecret\n    });\n    try {\n        const { searchParams } = new URL(req.url);\n        const publicId = searchParams.get(\"publicId\");\n        if (!publicId) {\n            return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n                error: \"Public ID is required\"\n            }, 400);\n        }\n        // Delete from Cloudinary\n        const result = await new Promise((resolve, reject)=>{\n            cloudinaryDelete.uploader.destroy(publicId, (error, result)=>{\n                if (error) reject(error);\n                else resolve(result);\n            });\n        });\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            success: true,\n            message: \"Image deleted successfully\"\n        });\n    } catch (error) {\n        console.error(\"Delete error:\", error);\n        return (0,_lib_api_security__WEBPACK_IMPORTED_MODULE_2__.secureResponse)({\n            error: error.message || \"Failed to delete file\"\n        }, 500);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1FBRUEsT0FBT3JDLGlFQUFjQSxDQUNuQjtZQUFFK0QsU0FBUztZQUFNVixTQUFTO1FBQTZCO0lBRTNELEVBQUUsT0FBTy9DLE9BQVk7UUFDbkI4QyxRQUFROUMsS0FBSyxDQUFDLGlCQUFpQkE7UUFDL0IsT0FBT04saUVBQWNBLENBQ25CO1lBQUVNLE9BQU9BLE1BQU0rQyxPQUFPLElBQUk7UUFBd0IsR0FDbEQ7SUFFSjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmxvZy1jbXMvLi9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50cz9hODhkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5pbXBvcnQgeyBzZWN1cmVSZXNwb25zZSB9IGZyb20gXCJAL2xpYi9hcGktc2VjdXJpdHlcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxOiBOZXh0UmVxdWVzdCkge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG5cbiAgaWYgKCFzZXNzaW9uIHx8IHNlc3Npb24udXNlci5yb2xlICE9PSBcImFkbWluXCIpIHtcbiAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoeyBlcnJvcjogXCJVbmF1dGhvcml6ZWRcIiB9LCA0MDEpO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgQ2xvdWRpbmFyeSBpcyBjb25maWd1cmVkXG4gIGNvbnN0IGNsb3VkTmFtZSA9IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQ0xPVURfTkFNRT8ucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCAnJyk7XG4gIGNvbnN0IGFwaUtleSA9IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQVBJX0tFWT8ucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCAnJyk7XG4gIGNvbnN0IGFwaVNlY3JldCA9IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQVBJX1NFQ1JFVD8ucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCAnJyk7XG4gIFxuICBpZiAoIWNsb3VkTmFtZSB8fCAhYXBpS2V5IHx8ICFhcGlTZWNyZXQpIHtcbiAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoXG4gICAgICB7IGVycm9yOiBcIkNsb3VkaW5hcnkgaXMgbm90IGNvbmZpZ3VyZWRcIiB9LFxuICAgICAgNTAwXG4gICAgKTtcbiAgfVxuXG4gIC8vIENvbmZpZ3VyZSBDbG91ZGluYXJ5XG4gIGNvbnN0IHsgdjI6IGNsb3VkaW5hcnlVcGxvYWRlciB9ID0gcmVxdWlyZSgnY2xvdWRpbmFyeScpO1xuICBjbG91ZGluYXJ5VXBsb2FkZXIuY29uZmlnKHtcbiAgICBjbG91ZF9uYW1lOiBjbG91ZE5hbWUsXG4gICAgYXBpX2tleTogYXBpS2V5LFxuICAgIGFwaV9zZWNyZXQ6IGFwaVNlY3JldCxcbiAgICBzZWN1cmU6IHRydWUsXG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgZm9ybURhdGEgPSBhd2FpdCByZXEuZm9ybURhdGEoKTtcbiAgICBjb25zdCBmaWxlID0gZm9ybURhdGEuZ2V0KFwiZmlsZVwiKSBhcyBGaWxlO1xuXG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoeyBlcnJvcjogXCJObyBmaWxlIHByb3ZpZGVkXCIgfSwgNDAwKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBmaWxlIHR5cGVcbiAgICBjb25zdCBhbGxvd2VkVHlwZXMgPSBbXCJpbWFnZS9qcGVnXCIsIFwiaW1hZ2UvanBnXCIsIFwiaW1hZ2UvcG5nXCIsIFwiaW1hZ2UvZ2lmXCIsIFwiaW1hZ2Uvd2VicFwiXTtcbiAgICBpZiAoIWFsbG93ZWRUeXBlcy5pbmNsdWRlcyhmaWxlLnR5cGUpKSB7XG4gICAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoXG4gICAgICAgIHsgZXJyb3I6IFwiSW52YWxpZCBmaWxlIHR5cGUuIE9ubHkgaW1hZ2VzIGFyZSBhbGxvd2VkLlwiIH0sXG4gICAgICAgIDQwMFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBmaWxlIHNpemUgKG1heCAxME1CIGZvciBDbG91ZGluYXJ5IGZyZWUgdGllcilcbiAgICBjb25zdCBtYXhTaXplID0gMTAgKiAxMDI0ICogMTAyNDsgLy8gMTBNQlxuICAgIGlmIChmaWxlLnNpemUgPiBtYXhTaXplKSB7XG4gICAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoXG4gICAgICAgIHsgZXJyb3I6IFwiRmlsZSBzaXplIGV4Y2VlZHMgMTBNQiBsaW1pdFwiIH0sXG4gICAgICAgIDQwMFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGZpbGUgdG8gYnVmZmVyIGZvciB1cGxvYWRcbiAgICBjb25zdCBieXRlcyA9IGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKTtcbiAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuZnJvbShieXRlcyk7XG5cbiAgICAvLyBVcGxvYWQgdG8gQ2xvdWRpbmFyeVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsb3VkaW5hcnlVcGxvYWRlci51cGxvYWRlci51cGxvYWQoXG4gICAgICBgZGF0YToke2ZpbGUudHlwZX07YmFzZTY0LCR7YnVmZmVyLnRvU3RyaW5nKCdiYXNlNjQnKX1gLFxuICAgICAge1xuICAgICAgICBmb2xkZXI6IFwiYXBrYXBwXCIsXG4gICAgICAgIHJlc291cmNlX3R5cGU6IFwiYXV0b1wiLFxuICAgICAgICB0cmFuc2Zvcm1hdGlvbjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHF1YWxpdHk6IFwiYXV0bzpnb29kXCIsXG4gICAgICAgICAgICBmZXRjaF9mb3JtYXQ6IFwiYXV0b1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFJldHVybiB0aGUgc2VjdXJlIFVSTCB3aXRoIHNlY3VyaXR5IGhlYWRlcnNcbiAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2Uoe1xuICAgICAgdXJsOiByZXN1bHQuc2VjdXJlX3VybCxcbiAgICAgIHB1YmxpY0lkOiByZXN1bHQucHVibGljX2lkLFxuICAgICAgd2lkdGg6IHJlc3VsdC53aWR0aCxcbiAgICAgIGhlaWdodDogcmVzdWx0LmhlaWdodCxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVcGxvYWQgZXJyb3I6XCIsIGVycm9yKTtcbiAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoXG4gICAgICB7IGVycm9yOiBlcnJvci5tZXNzYWdlIHx8IFwiRmFpbGVkIHRvIHVwbG9hZCBmaWxlXCIgfSxcbiAgICAgIGVycm9yLmh0dHBfY29kZSB8fCA1MDBcbiAgICApO1xuICB9XG59XG5cbi8vIE9wdGlvbmFsOiBBZGQgREVMRVRFIGVuZHBvaW50IHRvIHJlbW92ZSBpbWFnZXMgZnJvbSBDbG91ZGluYXJ5XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gREVMRVRFKHJlcTogTmV4dFJlcXVlc3QpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuXG4gIGlmICghc2Vzc2lvbiB8fCBzZXNzaW9uLnVzZXIucm9sZSAhPT0gXCJhZG1pblwiKSB7XG4gICAgcmV0dXJuIHNlY3VyZVJlc3BvbnNlKHsgZXJyb3I6IFwiVW5hdXRob3JpemVkXCIgfSwgNDAxKTtcbiAgfVxuXG4gIC8vIENvbmZpZ3VyZSBDbG91ZGluYXJ5XG4gIGNvbnN0IGNsb3VkTmFtZSA9IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQ0xPVURfTkFNRT8ucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCAnJyk7XG4gIGNvbnN0IGFwaUtleSA9IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQVBJX0tFWT8ucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCAnJyk7XG4gIGNvbnN0IGFwaVNlY3JldCA9IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQVBJX1NFQ1JFVD8ucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCAnJyk7XG4gIFxuICBpZiAoIWNsb3VkTmFtZSB8fCAhYXBpS2V5IHx8ICFhcGlTZWNyZXQpIHtcbiAgICByZXR1cm4gc2VjdXJlUmVzcG9uc2UoXG4gICAgICB7IGVycm9yOiBcIkNsb3VkaW5hcnkgaXMgbm90IGNvbmZpZ3VyZWRcIiB9LFxuICAgICAgNTAwXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IHsgdjI6IGNsb3VkaW5hcnlEZWxldGUgfSA9IHJlcXVpcmUoJ2Nsb3VkaW5hcnknKTtcbiAgY2xvdWRpbmFyeURlbGV0ZS5jb25maWcoe1xuICAgIGNsb3VkX25hbWU6IGNsb3VkTmFtZSxcbiAgICBhcGlfa2V5OiBhcGlLZXksXG4gICAgYXBpX3NlY3JldDogYXBpU2VjcmV0LFxuICB9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgIGNvbnN0IHB1YmxpY0lkID0gc2VhcmNoUGFyYW1zLmdldChcInB1YmxpY0lkXCIpO1xuXG4gICAgaWYgKCFwdWJsaWNJZCkge1xuICAgICAgcmV0dXJuIHNlY3VyZVJlc3BvbnNlKFxuICAgICAgICB7IGVycm9yOiBcIlB1YmxpYyBJRCBpcyByZXF1aXJlZFwiIH0sXG4gICAgICAgIDQwMFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBEZWxldGUgZnJvbSBDbG91ZGluYXJ5XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2xvdWRpbmFyeURlbGV0ZS51cGxvYWRlci5kZXN0cm95KHB1YmxpY0lkLCAoZXJyb3I6IGFueSwgcmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSByZWplY3QoZXJyb3IpO1xuICAgICAgICBlbHNlIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlY3VyZVJlc3BvbnNlKFxuICAgICAgeyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBcIkltYWdlIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5XCIgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRGVsZXRlIGVycm9yOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIHNlY3VyZVJlc3BvbnNlKFxuICAgICAgeyBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBkZWxldGUgZmlsZVwiIH0sXG4gICAgICA1MDBcbiAgICApO1xuICB9XG59XG5cbiJdLCJuYW1lcyI6WyJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJzZWN1cmVSZXNwb25zZSIsIlBPU1QiLCJyZXEiLCJzZXNzaW9uIiwidXNlciIsInJvbGUiLCJlcnJvciIsImNsb3VkTmFtZSIsInByb2Nlc3MiLCJlbnYiLCJDTE9VRElOQVJZX0NMT1VEX05BTUUiLCJyZXBsYWNlIiwiYXBpS2V5IiwiQ0xPVURJTkFSWV9BUElfS0VZIiwiYXBpU2VjcmV0IiwiQ0xPVURJTkFSWV9BUElfU0VDUkVUIiwidjIiLCJjbG91ZGluYXJ5VXBsb2FkZXIiLCJyZXF1aXJlIiwiY29uZmlnIiwiY2xvdWRfbmFtZSIsImFwaV9rZXkiLCJhcGlfc2VjcmV0Iiwic2VjdXJlIiwiZm9ybURhdGEiLCJmaWxlIiwiZ2V0IiwiYWxsb3dlZFR5cGVzIiwiaW5jbHVkZXMiLCJ0eXBlIiwibWF4U2l6ZSIsInNpemUiLCJieXRlcyIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsInJlc3VsdCIsInVwbG9hZGVyIiwidXBsb2FkIiwidG9TdHJpbmciLCJmb2xkZXIiLCJyZXNvdXJjZV90eXBlIiwidHJhbnNmb3JtYXRpb24iLCJxdWFsaXR5IiwiZmV0Y2hfZm9ybWF0IiwidXJsIiwic2VjdXJlX3VybCIsInB1YmxpY0lkIiwicHVibGljX2lkIiwid2lkdGgiLCJoZWlnaHQiLCJjb25zb2xlIiwibWVzc2FnZSIsImh0dHBfY29kZSIsIkRFTEVURSIsImNsb3VkaW5hcnlEZWxldGUiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRlc3Ryb3kiLCJzdWNjZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/upload/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/api-security.ts":
/*!*****************************!*\
  !*** ./lib/api-security.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   obfuscateResponse: () => (/* binding */ obfuscateResponse),\n/* harmony export */   secureResponse: () => (/* binding */ secureResponse)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n/**\n * Adds security headers to API responses to discourage inspection\n * Note: This doesn't truly hide responses, but makes them less visible\n */ function secureResponse(data, status = 200) {\n    const response = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data, {\n        status\n    });\n    // Add headers to discourage inspection\n    response.headers.set(\"X-Content-Type-Options\", \"nosniff\");\n    response.headers.set(\"X-Frame-Options\", \"DENY\");\n    response.headers.set(\"X-XSS-Protection\", \"1; mode=block\");\n    // Cache control to prevent caching sensitive data\n    response.headers.set(\"Cache-Control\", \"no-store, no-cache, must-revalidate, private\");\n    response.headers.set(\"Pragma\", \"no-cache\");\n    response.headers.set(\"Expires\", \"0\");\n    return response;\n}\n/**\n * Obfuscates sensitive data in responses\n * Note: This is not encryption, just makes it harder to read\n */ function obfuscateResponse(data) {\n    if (typeof data !== \"object\" || data === null) {\n        return data;\n    }\n    const sensitiveKeys = [\n        \"secret\",\n        \"password\",\n        \"token\",\n        \"key\",\n        \"apiSecret\",\n        \"apiKey\"\n    ];\n    const obfuscated = {\n        ...data\n    };\n    for(const key in obfuscated){\n        if (sensitiveKeys.some((sk)=>key.toLowerCase().includes(sk))) {\n            obfuscated[key] = \"***REDACTED***\";\n        } else if (typeof obfuscated[key] === \"object\") {\n            obfuscated[key] = obfuscateResponse(obfuscated[key]);\n        }\n    }\n    return obfuscated;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXBpLXNlY3VyaXR5LnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEyQztBQUUzQzs7O0NBR0MsR0FDTSxTQUFTQyxlQUFrQkMsSUFBTyxFQUFFQyxTQUFpQixHQUFHO0lBQzdELE1BQU1DLFdBQVdKLHFEQUFZQSxDQUFDSyxJQUFJLENBQUNILE1BQU07UUFBRUM7SUFBTztJQUVsRCx1Q0FBdUM7SUFDdkNDLFNBQVNFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLDBCQUEwQjtJQUMvQ0gsU0FBU0UsT0FBTyxDQUFDQyxHQUFHLENBQUMsbUJBQW1CO0lBQ3hDSCxTQUFTRSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxvQkFBb0I7SUFFekMsa0RBQWtEO0lBQ2xESCxTQUFTRSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxpQkFBaUI7SUFDdENILFNBQVNFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLFVBQVU7SUFDL0JILFNBQVNFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLFdBQVc7SUFFaEMsT0FBT0g7QUFDVDtBQUVBOzs7Q0FHQyxHQUNNLFNBQVNJLGtCQUFrQk4sSUFBUztJQUN6QyxJQUFJLE9BQU9BLFNBQVMsWUFBWUEsU0FBUyxNQUFNO1FBQzdDLE9BQU9BO0lBQ1Q7SUFFQSxNQUFNTyxnQkFBZ0I7UUFBQztRQUFVO1FBQVk7UUFBUztRQUFPO1FBQWE7S0FBUztJQUNuRixNQUFNQyxhQUFhO1FBQUUsR0FBR1IsSUFBSTtJQUFDO0lBRTdCLElBQUssTUFBTVMsT0FBT0QsV0FBWTtRQUM1QixJQUFJRCxjQUFjRyxJQUFJLENBQUNDLENBQUFBLEtBQU1GLElBQUlHLFdBQVcsR0FBR0MsUUFBUSxDQUFDRixNQUFNO1lBQzVESCxVQUFVLENBQUNDLElBQUksR0FBRztRQUNwQixPQUFPLElBQUksT0FBT0QsVUFBVSxDQUFDQyxJQUFJLEtBQUssVUFBVTtZQUM5Q0QsVUFBVSxDQUFDQyxJQUFJLEdBQUdILGtCQUFrQkUsVUFBVSxDQUFDQyxJQUFJO1FBQ3JEO0lBQ0Y7SUFFQSxPQUFPRDtBQUNUIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmxvZy1jbXMvLi9saWIvYXBpLXNlY3VyaXR5LnRzPzQ3MmEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuXG4vKipcbiAqIEFkZHMgc2VjdXJpdHkgaGVhZGVycyB0byBBUEkgcmVzcG9uc2VzIHRvIGRpc2NvdXJhZ2UgaW5zcGVjdGlvblxuICogTm90ZTogVGhpcyBkb2Vzbid0IHRydWx5IGhpZGUgcmVzcG9uc2VzLCBidXQgbWFrZXMgdGhlbSBsZXNzIHZpc2libGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlY3VyZVJlc3BvbnNlPFQ+KGRhdGE6IFQsIHN0YXR1czogbnVtYmVyID0gMjAwKTogTmV4dFJlc3BvbnNlIHtcbiAgY29uc3QgcmVzcG9uc2UgPSBOZXh0UmVzcG9uc2UuanNvbihkYXRhLCB7IHN0YXR1cyB9KTtcbiAgXG4gIC8vIEFkZCBoZWFkZXJzIHRvIGRpc2NvdXJhZ2UgaW5zcGVjdGlvblxuICByZXNwb25zZS5oZWFkZXJzLnNldCgnWC1Db250ZW50LVR5cGUtT3B0aW9ucycsICdub3NuaWZmJyk7XG4gIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdYLUZyYW1lLU9wdGlvbnMnLCAnREVOWScpO1xuICByZXNwb25zZS5oZWFkZXJzLnNldCgnWC1YU1MtUHJvdGVjdGlvbicsICcxOyBtb2RlPWJsb2NrJyk7XG4gIFxuICAvLyBDYWNoZSBjb250cm9sIHRvIHByZXZlbnQgY2FjaGluZyBzZW5zaXRpdmUgZGF0YVxuICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ2FjaGUtQ29udHJvbCcsICduby1zdG9yZSwgbm8tY2FjaGUsIG11c3QtcmV2YWxpZGF0ZSwgcHJpdmF0ZScpO1xuICByZXNwb25zZS5oZWFkZXJzLnNldCgnUHJhZ21hJywgJ25vLWNhY2hlJyk7XG4gIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdFeHBpcmVzJywgJzAnKTtcbiAgXG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBPYmZ1c2NhdGVzIHNlbnNpdGl2ZSBkYXRhIGluIHJlc3BvbnNlc1xuICogTm90ZTogVGhpcyBpcyBub3QgZW5jcnlwdGlvbiwganVzdCBtYWtlcyBpdCBoYXJkZXIgdG8gcmVhZFxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JmdXNjYXRlUmVzcG9uc2UoZGF0YTogYW55KTogYW55IHtcbiAgaWYgKHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBkYXRhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBjb25zdCBzZW5zaXRpdmVLZXlzID0gWydzZWNyZXQnLCAncGFzc3dvcmQnLCAndG9rZW4nLCAna2V5JywgJ2FwaVNlY3JldCcsICdhcGlLZXknXTtcbiAgY29uc3Qgb2JmdXNjYXRlZCA9IHsgLi4uZGF0YSB9O1xuXG4gIGZvciAoY29uc3Qga2V5IGluIG9iZnVzY2F0ZWQpIHtcbiAgICBpZiAoc2Vuc2l0aXZlS2V5cy5zb21lKHNrID0+IGtleS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNrKSkpIHtcbiAgICAgIG9iZnVzY2F0ZWRba2V5XSA9ICcqKipSRURBQ1RFRCoqKic7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JmdXNjYXRlZFtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgb2JmdXNjYXRlZFtrZXldID0gb2JmdXNjYXRlUmVzcG9uc2Uob2JmdXNjYXRlZFtrZXldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JmdXNjYXRlZDtcbn1cblxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInNlY3VyZVJlc3BvbnNlIiwiZGF0YSIsInN0YXR1cyIsInJlc3BvbnNlIiwianNvbiIsImhlYWRlcnMiLCJzZXQiLCJvYmZ1c2NhdGVSZXNwb25zZSIsInNlbnNpdGl2ZUtleXMiLCJvYmZ1c2NhdGVkIiwia2V5Iiwic29tZSIsInNrIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/api-security.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst authOptions = {\n    secret: process.env.NEXTAUTH_SECRET,\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                try {\n                    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n                        where: {\n                            email: credentials.email\n                        }\n                    });\n                    if (!user || user.role !== \"admin\") {\n                        return null;\n                    }\n                    const isValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                    if (!isValid) {\n                        return null;\n                    }\n                    return {\n                        id: user.id,\n                        email: user.email,\n                        name: user.name,\n                        role: user.role\n                    };\n                } catch (error) {\n                    console.error(\"Auth error:\", error);\n                    return null;\n                }\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    pages: {\n        signIn: \"/login\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.sub;\n                session.user.role = token.role;\n            }\n            return session;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNrRTtBQUM1QjtBQUNSO0FBRXZCLE1BQU1HLGNBQStCO0lBQzFDQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLFdBQVc7UUFDVFIsMkVBQW1CQSxDQUFDO1lBQ2xCUyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE9BQU87Z0JBQ1Q7Z0JBRUEsSUFBSTtvQkFDRixNQUFNRSxPQUFPLE1BQU1mLCtDQUFNQSxDQUFDZSxJQUFJLENBQUNDLFVBQVUsQ0FBQzt3QkFDeENDLE9BQU87NEJBQUVQLE9BQU9ELFlBQVlDLEtBQUs7d0JBQUM7b0JBQ3BDO29CQUVBLElBQUksQ0FBQ0ssUUFBUUEsS0FBS0csSUFBSSxLQUFLLFNBQVM7d0JBQ2xDLE9BQU87b0JBQ1Q7b0JBRUEsTUFBTUMsVUFBVSxNQUFNbEIsdURBQWMsQ0FDbENRLFlBQVlJLFFBQVEsRUFDcEJFLEtBQUtGLFFBQVE7b0JBR2YsSUFBSSxDQUFDTSxTQUFTO3dCQUNaLE9BQU87b0JBQ1Q7b0JBRUEsT0FBTzt3QkFDTEUsSUFBSU4sS0FBS00sRUFBRTt3QkFDWFgsT0FBT0ssS0FBS0wsS0FBSzt3QkFDakJGLE1BQU1PLEtBQUtQLElBQUk7d0JBQ2ZVLE1BQU1ILEtBQUtHLElBQUk7b0JBQ2pCO2dCQUNGLEVBQUUsT0FBT0ksT0FBTztvQkFDZEMsUUFBUUQsS0FBSyxDQUFDLGVBQWVBO29CQUM3QixPQUFPO2dCQUNUO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RFLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLE9BQU87UUFDTEMsUUFBUTtJQUNWO0lBQ0FDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRWYsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JlLE1BQU1aLElBQUksR0FBR0gsS0FBS0csSUFBSTtZQUN4QjtZQUNBLE9BQU9ZO1FBQ1Q7UUFDQSxNQUFNTixTQUFRLEVBQUVBLE9BQU8sRUFBRU0sS0FBSyxFQUFFO1lBQzlCLElBQUlOLFFBQVFULElBQUksRUFBRTtnQkFDaEJTLFFBQVFULElBQUksQ0FBQ00sRUFBRSxHQUFHUyxNQUFNQyxHQUFHO2dCQUMzQlAsUUFBUVQsSUFBSSxDQUFDRyxJQUFJLEdBQUdZLE1BQU1aLElBQUk7WUFDaEM7WUFDQSxPQUFPTTtRQUNUO0lBQ0Y7QUFDRixFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmxvZy1jbXMvLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogXCJDcmVkZW50aWFsc1wiLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJlbWFpbFwiIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9LFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKCF1c2VyIHx8IHVzZXIucm9sZSAhPT0gXCJhZG1pblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoXG4gICAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICAgIHVzZXIucGFzc3dvcmRcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoIGVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogXCJqd3RcIixcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2xvZ2luXCIsXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLnJvbGUgPSB1c2VyLnJvbGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5zdWIhO1xuICAgICAgICBzZXNzaW9uLnVzZXIucm9sZSA9IHRva2VuLnJvbGUgYXMgc3RyaW5nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfSxcbiAgfSxcbn07XG5cbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwicHJpc21hIiwiYmNyeXB0IiwiYXV0aE9wdGlvbnMiLCJzZWNyZXQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVEFVVEhfU0VDUkVUIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJyb2xlIiwiaXNWYWxpZCIsImNvbXBhcmUiLCJpZCIsImVycm9yIiwiY29uc29sZSIsInNlc3Npb24iLCJzdHJhdGVneSIsInBhZ2VzIiwic2lnbkluIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJzdWIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE2QztBQUU3QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFFO0FBRWxFLElBQUlJLElBQXlCLEVBQWNILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL2Jsb2ctY21zLy4vbGliL3ByaXNtYS50cz85ODIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xuICBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KClcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWFcblxuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/@babel","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/lodash","vendor-chunks/cloudinary","vendor-chunks/q"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2FUsers%2Fhunxai%2Fapkapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fhunxai%2Fapkapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();