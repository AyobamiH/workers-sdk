import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const packageRoot = path.resolve(__dirname, "..");
const tempRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), "wrangler-published-types-")
);
const packDir = path.join(tempRoot, "pack");
const consumerDir = path.join(tempRoot, "consumer");

try {
	fs.mkdirSync(packDir);
	fs.mkdirSync(consumerDir);

	execFileSync(pnpm, ["pack", "--pack-destination", packDir], {
		cwd: packageRoot,
		stdio: "inherit",
	});

	const tarballs = fs.readdirSync(packDir).filter((name) => name.endsWith(".tgz"));
	if (tarballs.length !== 1) {
		throw new Error(
			`Expected one Wrangler tarball, found ${tarballs.length}: ${tarballs.join(", ")}`
		);
	}

	const tarball = path.join(packDir, tarballs[0]);
	fs.writeFileSync(
		path.join(consumerDir, "package.json"),
		JSON.stringify({ private: true, type: "module" }, null, 2)
	);
	fs.writeFileSync(
		path.join(consumerDir, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					lib: ["ESNext", "DOM", "DOM.Iterable"],
					module: "ESNext",
					moduleResolution: "bundler",
					strict: true,
					skipLibCheck: false,
					noEmit: true,
					types: ["node"],
				},
				include: ["index.ts"],
			},
			null,
			2
		)
	);
	fs.writeFileSync(
		path.join(consumerDir, "index.ts"),
		'import type { GetPlatformProxyOptions } from "wrangler";\n\nexport const options: GetPlatformProxyOptions = {};\n'
	);

	execFileSync(
		npm,
		[
			"install",
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
			"--no-package-lock",
			"--save-dev",
			tarball,
			"typescript@5.9.3",
			"@types/node@26.4.1",
			"@cloudflare/workers-types@5.20261001.1",
		],
		{ cwd: consumerDir, stdio: "inherit" }
	);

	const tsc = path.join(
		consumerDir,
		"node_modules",
		".bin",
		process.platform === "win32" ? "tsc.cmd" : "tsc"
	);
	execFileSync(tsc, ["-p", "tsconfig.json"], {
		cwd: consumerDir,
		stdio: "inherit",
	});
} finally {
	fs.rmSync(tempRoot, { recursive: true, force: true });
}
