"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContentWithOpenAI = void 0;
// functions/src/lib/openai.ts
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
const generateContentWithOpenAI = async ({ system, user, }) => {
    var _a, _b, _c;
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
        temperature: 0.7,
    });
    return (_c = (_b = (_a = res.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "";
};
exports.generateContentWithOpenAI = generateContentWithOpenAI;
//# sourceMappingURL=openai.js.map