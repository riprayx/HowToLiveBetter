import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const source = join(root, "chatgpt-plugin", "life-decision-guide");
const buildRoot = join(root, ".build", "chatgpt-plugin");
const skillRoot = join(buildRoot, "life-decision-guide");
const dist = join(root, "dist");
const zip = join(dist, "skill.zip");

async function copy(src, dest) {
  if (!existsSync(src)) throw new Error(`Missing required path: ${src}`);
  await mkdir(dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true });
}

await rm(buildRoot, { recursive: true, force: true });
await mkdir(skillRoot, { recursive: true });
await mkdir(dist, { recursive: true });

await copy(join(source, "SKILL.md"), join(skillRoot, "SKILL.md"));
await copy(join(source, "agents"), join(skillRoot, "agents"));
await copy(join(root, "README.md"), join(skillRoot, "references", "README.md"));
await copy(join(root, "index.html"), join(skillRoot, "references", "index.html"));
await copy(join(root, "book"), join(skillRoot, "references", "book"));
await copy(join(root, "docs"), join(skillRoot, "references", "docs"));
await copy(join(root, "LICENSE"), join(skillRoot, "references", "LICENSE"));
await copy(join(root, "LICENSE-CODE"), join(skillRoot, "references", "LICENSE-CODE"));

const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
function gitRemote(name) {
  try {
    return execFileSync("git", ["remote", "get-url", name], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}
const sourceRepo = process.env.SOURCE_REPO_URL || gitRemote("upstream") || gitRemote("origin");
await writeFile(
  join(skillRoot, "references", "SNAPSHOT.md"),
  `# Snapshot\n\n- Source: ${sourceRepo}\n- Commit: ${commit}\n- Built: ${new Date().toISOString()}\n`
);

await rm(zip, { force: true });
if (process.platform === "win32") {
  execFileSync("powershell.exe", [
    "-NoProfile",
    "-Command",
    `Set-Location '${buildRoot}'; Compress-Archive -Path 'life-decision-guide' -DestinationPath '${zip}' -Force`
  ], { stdio: "inherit" });
} else {
  execFileSync("zip", ["-qr", zip, "life-decision-guide"], {
    cwd: buildRoot,
    stdio: "inherit"
  });
}

console.log(zip);
