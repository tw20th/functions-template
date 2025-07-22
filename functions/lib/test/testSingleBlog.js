"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const generateBlogFromItem_1 = require("../scripts/blog/generateBlogFromItem");
(async () => {
    const doc = await firebaseAdmin_1.db.collection("monitoredItems").doc("aidort:10000403").get();
    if (!doc.exists) {
        console.log("❌ ドキュメントが見つかりません");
        return;
    }
    const data = doc.data();
    if (!data) {
        console.log("❌ doc.data() が undefined");
        return;
    }
    const item = data;
    await (0, generateBlogFromItem_1.generateBlogFromItem)(item);
})();
//# sourceMappingURL=testSingleBlog.js.map