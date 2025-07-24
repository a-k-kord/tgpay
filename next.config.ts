import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["grammy"],
    webpack: (config) => {
        config.externals = [...(config.externals || []), "grammy"];
        return config;
    },
    // Add Turbopack configuration
    turbopack: {
        resolveAlias: {
            // Ensure grammy is properly resolved
            grammy: "grammy"
        }
    }
};

export default nextConfig;
