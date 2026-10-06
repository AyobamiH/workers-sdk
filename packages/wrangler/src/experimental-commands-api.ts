import { createCLIParser } from "./index";

export type ExperimentalWranglerCommandStatus =
	| "experimental"
	| "alpha"
	| "private beta"
	| "open beta"
	| "stable";

export interface ExperimentalWranglerCommandMetadata {
	description?: string;
	status?: ExperimentalWranglerCommandStatus;
	hidden?: boolean;
	owner?: string;
}

export interface ExperimentalWranglerCommandArg {
	alias?: string | readonly string[];
	choices?: readonly unknown[];
	describe?: string;
	hidden?: boolean;
}

export interface ExperimentalWranglerCommandBehaviour {
	supportTemporary?: boolean;
}

export type ExperimentalWranglerCommandDefinition =
	| {
			type: "command";
			command: `wrangler${string}`;
			metadata: ExperimentalWranglerCommandMetadata;
			args?: Record<string, ExperimentalWranglerCommandArg>;
			behaviour?: ExperimentalWranglerCommandBehaviour;
	  }
	| {
			type: "namespace";
			command: `wrangler${string}`;
			metadata: ExperimentalWranglerCommandMetadata;
	  }
	| {
			type: "alias";
			command: `wrangler${string}`;
			metadata?: ExperimentalWranglerCommandMetadata;
	  };

export interface ExperimentalWranglerCommandTreeNode {
	definition?: ExperimentalWranglerCommandDefinition;
	subtree: Map<string, ExperimentalWranglerCommandTreeNode>;
}

export interface ExperimentalWranglerGlobalFlag {
	alias?: string | readonly string[];
	array?: boolean;
	default?: boolean;
	describe?: string;
	hidden?: boolean;
	requiresArg?: boolean;
	type?: "boolean" | "string";
}

export interface ExperimentalWranglerCommands {
	registry: ExperimentalWranglerCommandTreeNode;
	globalFlags: Record<string, ExperimentalWranglerGlobalFlag>;
}

/**
 * EXPERIMENTAL: Get all registered Wrangler commands for documentation generation.
 * This API is experimental and may change without notice.
 *
 * @returns An object containing the command tree structure and global flags
 */
export function experimental_getWranglerCommands(): ExperimentalWranglerCommands {
	const { registry, globalFlags } = createCLIParser([]);
	return {
		registry:
			registry.getDefinitionTreeRoot() as ExperimentalWranglerCommandTreeNode,
		globalFlags,
	};
}
