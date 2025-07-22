"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("dotenv/config");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const app = (0, app_1.getApps)().length === 0
    ? (0, app_1.initializeApp)({
        credential: (0, app_1.applicationDefault)(),
    })
    : (0, app_1.getApps)()[0];
exports.db = (0, firestore_1.getFirestore)(app);
//# sourceMappingURL=firebaseAdmin.js.map