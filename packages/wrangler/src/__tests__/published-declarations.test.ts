import { mkdirSync, writeFileSync } from "node:fs";
import { INHERIT_SYMBOL } from "@cloudflare/workers-utils";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expectTypeOf, it } from "vitest";
import { checkPublishedDeclarations } from "../../scripts/check-published-declarations";
import type { Binding, StartDevWorkerInput } from "../../wrangler-dist/cli";
import type { Binding as SharedBinding } from "@cloudflare/workers-utils";

it("preserves shared binding identity in the published declarations", () => {
	expectTypeOf<Binding>().toEqualTypeOf<SharedBinding>();

	type InheritedId = Extract<
		Extract<Binding, { type: "kv_namespace" }>["id"],
		symbol
	>;
	expectTypeOf<InheritedId>().toEqualTypeOf<typeof INHERIT_SYMBOL>();

	const binding = {
		type: "kv_namespace",
		id: INHERIT_SYMBOL,
	} satisfies SharedBinding;
	expectTypeOf(binding).toExtend<Binding>();
	expectTypeOf({
		bindings: { CACHE: binding },
	}).toExtend<StartDevWorkerInput>();

	const differentSymbol = Symbol("different binding");
	expectTypeOf(differentSymbol).not.toExtend<InheritedId>();
});

describe("published declaration boundaries", () => {
	runInTempDir();
	beforeEach(() => {
		mkdirSync("dist");
		writeFileSync(
			"package.json",
			JSON.stringify({ name: "declaration-fixture", types: "dist/index.d.ts" })
		);
	});

	it.each([
		{
			declaration:
				'import type { AssetConfig } from "@cloudflare/workers-shared";',
			missing: "@cloudflare/workers-shared",
		},
		{
			declaration: 'import type { RequestInfo } from "./types/index";',
			missing: "./types/index",
		},
		{
			declaration: '/// <reference types="private-types" />',
			missing: "private-types",
		},
	])("rejects unresolved $missing", ({ declaration, missing }, { expect }) => {
		writeFileSync("dist/index.d.ts", declaration);
		expect(() => checkPublishedDeclarations(process.cwd())).toThrow(missing);
	});

	it("accepts relative imports to declarations shipped in the package", ({
		expect,
	}) => {
		writeFileSync("dist/index.d.ts", 'export type { Binding } from "./types";');
		writeFileSync("dist/types.d.ts", 'export type Binding = { type: "test" };');
		expect(() => checkPublishedDeclarations(process.cwd())).not.toThrow();
	});
});
