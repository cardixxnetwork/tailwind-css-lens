import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["src/webview/cssEditor.ts"],
  bundle: true,
  outfile: "out/webview/cssEditor.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: !isWatch,
  sourcemap: isWatch,
  tsconfig: "tsconfig.webview.json",
});

if (isWatch) {
  await ctx.watch();
  console.log("Watching webview...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
