export interface DSHTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: any) => Promise<string>;
}

export interface DSHContext {
  userQuery: string;
  route?: string;
  verifiedChunks?: string[];
  proposedAnswer?: string;
  metadata: Record<string, unknown>;
}

export type DSHHook = (ctx: DSHContext) => Promise<void>;

export class DeepSeekHarness {
  private tools: Map<string, DSHTool> = new Map();
  private preHooks: DSHHook[] = [];
  private postHooks: DSHHook[] = [];

  public registerTool(tool: DSHTool): void {
    this.tools.set(tool.name, tool);
  }

  public registerTools(tools: DSHTool[]): void {
    tools.forEach((t) => this.registerTool(t));
  }

  public addPreHook(hook: DSHHook): void {
    this.preHooks.push(hook);
  }

  public addPostHook(hook: DSHHook): void {
    this.postHooks.push(hook);
  }

  public async executeTool(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`[DSH Error] Tool '${name}' is not registered in the harness.`);
    }
    return tool.execute(args);
  }

  public async runPreHooks(ctx: DSHContext): Promise<void> {
    for (const hook of this.preHooks) {
      await hook(ctx);
    }
  }

  public async runPostHooks(ctx: DSHContext): Promise<void> {
    for (const hook of this.postHooks) {
      await hook(ctx);
    }
  }

  public getToolManifest(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }
}