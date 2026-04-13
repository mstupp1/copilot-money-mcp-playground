#!/opt/homebrew/bin/node

// The published package logs to stdout, which breaks stdio-based MCP.
// Redirect regular logs to stderr before loading the real entrypoint.
console.log = (...args) => console.error(...args);
console.info = (...args) => console.error(...args);
console.debug = (...args) => console.error(...args);

await import("/Users/mylesstupp/.npm/_npx/46a280f6c2a49d45/node_modules/@iqai/mcp-telegram/dist/index.js");
