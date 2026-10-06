import { createCLIParser } from "./index";

export type ExperimentalCommandMetadata = {
	description: string;
	status:
		| "experimental"
		| "alpha"
		| "private beta"
		| "open beta"
		| "stable";
	statusMessage?: string;
	deprecated?: boolean;
	deprecatedMessage?: string;
	hidden?: boolean;
	owner: string;
	category?: string;
	epilogue?: string;
	examples?: Array<{ command: string; description: string }>;
	hideGlobalFlags?: string[];
};

export type ExperimentalCommandArgDefinition = {
	alias?: string | readonly string[];
	array?: boolean;
	choices?: readonly unknown[];
	default?: unknown;
	deprecated?: boolean | string;
	describe?: string;
	demandOption?: boolean | string;
	hidden?: boolean;
	requiresArg?: boolean;
	type?: string;
};

export type ExperimentalCommandDefinition =
	| {
			type: "command";
			command: `wrangler${string}`;
			metadata: ExperimentalCommandMetadata;
			args?: Record<string, ExperimentalCommandArgDefinition>;
			behaviour?: {
				supportTemporary?: boolean;
			};
			positionalArgs?: string[];
	  }
	| {
			type: "namespace";
			command: `wrangler${string}`;
			metadata: ExperimentalCommandMetadata;
	  }
	| {
			type: "alias";
			command: `wrangler${string}`;
			aliasOf: `wrangler${string}`;
			metadata?: Partial<ExperimentalCommandMetadata>;
	  };

export type ExperimentalDefinitionTreeNode = {
	definition?: ExperimentalCommandDefinition;
	subtree: Map<string, ExperimentalDefinitionTreeNode>;
};

export type ExperimentalGlobalFlags = Record<
	string,
	ExperimentalCommandArgDefinition
>;

export type ExperimentalWranglerCommands = {
	registry: ExperimentalDefinitionTreeNode;
	globalFlags: ExperimentalGlobalFlags;
};

/**
 * EXPERIMENTAL: Get all registered Wrangler commands for documentation generation.
 * This API is experimental and may change without notice.
 *
 * The published return type intentionally describes only the serialisable
 * command metadata consumed by external tooling. Internal handler/context
 * types are excluded so implementation-only dependencies do not become part
 * of Wrangler's public declaration boundary.
 *
 * @returns An object containing the command tree structure and global flags
 */
export function experimental_getWranglerCommands(): ExperimentalWranglerCommands {
	const { registry, globalFlags } = createCLIParser([]);
	return {
		registry:
			registry.getDefinitionTreeRoot() as ExperimentalDefinitionTreeNode,
		globalFlags: globalFlags as ExperimentalGlobalFlags,
	};
}
