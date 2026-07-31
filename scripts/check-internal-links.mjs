import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesIn(absolute)));
    else if (entry.name.endsWith(".html")) files.push(absolute);
  }
  return files;
}

function targetFile(href) {
  const clean = href.split("#", 1)[0].split("?", 1)[0];
  if (!clean || !clean.startsWith("/")) return null;
  if (clean.endsWith("/")) return path.join(root, clean.slice(1), "index.html");
  if (path.extname(clean)) return path.join(root, clean.slice(1));
  return path.join(root, clean.slice(1), "index.html");
}

const missing = new Set();
for (const htmlFile of await filesIn(root)) {
  const html = await readFile(htmlFile, "utf8");
  for (const href of html.matchAll(/href="([^"]+)"/g)) {
    const target = targetFile(href[1]);
    if (!target) continue;
    try {
      await stat(target);
    } catch {
      missing.add(`${path.relative(root, htmlFile)} → ${href[1]}`);
    }
  }
}

if (missing.size > 0) {
  console.error([...missing].join("\n"));
  process.exitCode = 1;
} else {
  console.log("Internal links: all targets resolve.");
}
