import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// tools
import { discoverApiLayerHandler } from "./tools/discoverApiLayer.js";
import { discoverComponentsHandler } from "./tools/discoverComponents.js";
import { discoverPagesHandler } from "./tools/discoverPages.js";
import { discoverStateManagementHandler } from "./tools/discoverStateManagement.js";
import { discoverFrontendArchitectureHandler } from "./tools/discoverFrontendArchitecture.js";
import { discoverServicesHandler } from "./tools/discoverServices.js";
import { discoverApiDependenciesHandler } from "./tools/discoverApiDependencies.js";
import { discoverEnvironmentConfigHandler } from "./tools/discoverEnvironmentConfig.js";
import { findFeatureHandler } from "./tools/findFeature.js";
import { findFeatureImplementationHandler } from "./tools/findFeatureImplementation.js";

const server = new McpServer({
  name: "hub-frontend-mcp",
  version: "1.0.0",
});

server.tool(
  "discover_frontend_architecture",
  "Discover frontend architecture",
  {},
  discoverFrontendArchitectureHandler
);

server.tool(
  "discover_api_layer",
  "Discover frontend API layer",
  {},
  discoverApiLayerHandler
);

server.tool(
  "discover_components",
  "Discover frontend components",
  {},
  discoverComponentsHandler
);

server.tool(
  "discover_pages",
  "Discover frontend pages",
  {},
  discoverPagesHandler
);

server.tool(
  "discover_state_management",
  "Discover frontend state management",
  {},
  discoverStateManagementHandler
);

server.tool(
  "discover_services",
  "Discover frontend services",
  {},
  discoverServicesHandler
);

server.tool(
  "discover_api_dependencies",
  "Discover frontend API dependencies",
  {},
  discoverApiDependenciesHandler
);

server.tool(
  "discover_environment_config",
  "Discover required environment configuration",
  {},
  discoverEnvironmentConfigHandler
);

server.tool(
  "find_feature_implementation",
  "Find feature implementation details",
  {},
  findFeatureImplementationHandler
);

server.tool(
  "find_feature",
  "Find files matching a feature name",
  {
    feature: z.string(),
  },
  findFeatureHandler
);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Hub Frontend MCP Server Running...");
}

main().catch(console.error);