import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";

const supabaseUrl = "https://bebmdntiwjlrgcsuanqr.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_SERVICE_KEY || "YOUR_SERVICE_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PUBLIC_TABLES = [
  "profiles",
  "batches",
  "courses",
  "careers",
  "events",
  "event_rsvps",
  "opportunities",
  "announcements",
  "notifications",
  "donations",
];

function escapeSQL(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function toInsertSQL(table, rows) {
  if (!rows.length) return `-- ${table}: no data\n`;
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const values = rows.map((r) => {
    const vals = cols.map((c) => escapeSQL(r[c])).join(", ");
    return `  (${vals})`;
  });
  return `insert into public."${table}" (${colList}) values\n${values.join(",\n")};\n`;
}

async function fetchTable(table) {
  let all = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1)
      .order("id");
    if (error) {
      console.error(`  ${table}: ERROR - ${error.message}`);
      return [];
    }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    from += pageSize;
    if (data.length < pageSize) break;
  }
  console.log(`  ${table}: ${all.length} rows`);
  return all;
}

async function main() {
  console.log("Exporting data from Supabase...\n");
  const output = [
    `-- CvSU Naic Online Alumni Portal — Data Export`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- All tables exported using service_role key`,
    "",
    "set session_replication_role = 'replica';",
    "",
  ];

  for (const table of PUBLIC_TABLES) {
    const rows = await fetchTable(table);
    output.push(`-- ${table} (${rows.length} rows)`);
    output.push("");
    output.push(toInsertSQL(table, rows));
  }

  output.push("set session_replication_role = 'origin';");
  output.push("");

  writeFileSync("supabase/data_export.sql", output.join("\n"), "utf-8");
  console.log(`\nDone! Written to supabase/data_export.sql`);
}

main().catch((err) => {
  console.error("Export failed:", err.message);
  process.exit(1);
});
