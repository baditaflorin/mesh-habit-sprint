import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-habit-sprint",
  description: "A time-boxed peer-to-peer habit challenge with shared check-ins and progress.",
  accentHex: "#65a30d",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
