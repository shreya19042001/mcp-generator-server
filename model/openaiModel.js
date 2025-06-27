const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 📚 Load README.md
const readmePath = path.join(__dirname, "../README.md");
const readmeContent = fs.existsSync(readmePath)
  ? fs.readFileSync(readmePath, "utf-8")
  : "";

// ✅ Load Rules & Schema
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, "../Rules.json")));
const schemaDefinition = require("../schema.json");

// ✅ AJV Schema Validator
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const schemaValidator = ajv.compile(schemaDefinition);

// 🔍 Top-matching examples
function getRelevantExamples(prompt, examples, limit = 3) {
  const promptLower = prompt.toLowerCase();
  return examples
    .map(e => ({
      ...e,
      score: e.prompt.toLowerCase().split(/\s+/).filter(w => promptLower.includes(w)).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// 🔁 label before input
function reorderLabelBeforeField(fields) {
  return fields.map(field => {
    const keys = Object.keys(field);
    const reordered = {};
    const labelKey = keys.find(k => /^label(_\d+)?$/.test(k));
    if (labelKey) reordered[labelKey] = field[labelKey];
    keys.forEach(k => {
      if (k !== labelKey) reordered[k] = field[k];
    });
    return reordered;
  });
}

// 📊 Fix barGraph → barGraph_1 with categories/values1
function fixBarGraphs(fields) {
  return fields.map(f => {
    if (f.barGraph) {
      const graph = f.barGraph;
      return {
        barGraph_1: {
          title: graph.title || "Bar Graph",
          categories: graph.data?.map(d => d.label) || [],
          values1: graph.data?.map(d => d.value) || []
        }
      };
    }
    return f;
  });
}

// 🧹 Remove invalid/unknown keys
function filterUnknownComponents(fields, allowedList) {
  return fields.map(field => {
    const filtered = {};
    for (const key of Object.keys(field)) {
      const base = key.split("_")[0];
      if (allowedList.includes(base) || key === "EventButton") {
        filtered[key] = field[key];
      } else {
        console.warn(`❌ Removed unknown component: ${key}`);
      }
    }
    return filtered;
  });
}

// 🧼 Normalize the full schema
function normalizeSchema(schema) {
  const pageKey = Object.keys(schema)[0];
  const page = schema[pageKey]?.[0];
  const section = page?.section || {};
  const allowed = [...rules.components.primitive, ...rules.components.composite];

  for (const rowKey of Object.keys(section)) {
    const row = section[rowKey];
    if (!row || typeof row !== "object") continue;

    for (const colKey of Object.keys(row)) {
      const col = row[colKey];
      if (!col?.Fields) continue;

      col.Fields = col.Fields.filter(f => Object.keys(f).length > 0);
      col.Fields = fixBarGraphs(col.Fields);
      col.Fields = reorderLabelBeforeField(col.Fields);
      col.Fields = filterUnknownComponents(col.Fields, allowed);

      // Remove column if empty
      if (col.Fields.length === 0) {
        delete row[colKey];
      }
    }

    // Remove row if empty
    if (Object.keys(row).length === 0) {
      delete section[rowKey];
    }
  }

  return schema;
}

// 🤖 Main GPT Flow
async function generateForm(prompt, context) {
  const few = getRelevantExamples(prompt, context.examples, 3);
  const allowedPrimitives = rules.components.primitive.join(", ");
  const allowedComposites = rules.components.composite.join(", ");

  const systemPrompt = `
You are a strict JSON UI generator for a low-code platform.

RULES:
- ✅ Allowed primitives: ${allowedPrimitives}
- ✅ Allowed composites: ${allowedComposites}
- ❌ NEVER use fields like header, title, fooBar_1
- ✅ Use this structure:
  Page → css, section → style → Row_X → col_X → Fields[]
- ✅ Inputs (e.g. text_1, dropDown_1) must have:
    - value
    - set
    - validation
- ✅ label_X must appear before inputs in Fields[]
- ✅ barGraph must use "categories" and "values1" — NOT "data"
- ✅ JSON only — no markdown or explanations

Extra Guidelines:
${readmeContent}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...few.flatMap(e => [
      { role: "user", content: `Prompt: ${e.prompt}` },
      { role: "assistant", content: JSON.stringify(e.schema, null, 2) }
    ]),
    { role: "user", content: `Prompt: ${prompt}` }
  ];

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.3,
        max_tokens: 1000
      });

      const resultText = response.choices[0].message.content.trim();
      const rawSchema = JSON.parse(resultText);
      const normalized = normalizeSchema(rawSchema);

      if (!schemaValidator(normalized)) {
        console.error("❌ Schema validation errors:", schemaValidator.errors);
        throw new Error("Schema validation failed.");
      }

      return normalized;
    } catch (err) {
      console.warn(`⚠️ Retry ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        fs.writeFileSync("gpt-failure-dump.json", JSON.stringify({ prompt, messages }, null, 2));
        throw new Error("OpenAI generation failed after 3 retries.");
      }
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
}

module.exports = { generateForm };
