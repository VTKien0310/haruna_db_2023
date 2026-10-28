/*
 * Prints a hash of each Vue, TypeScript, JavaScript, or CSS file's code tokens, ignoring comments and
 * whitespace, so the hash taken before and after a comment purge proves only comments changed.
 *
 * Usage: node .agents/skills/comment-purge/scripts/code-token-hash.ts <file> [<file> ...]
 *   Prints `<sha256>  <path>` per file. Exits 1 when a file cannot be read or hashed.
 *
 * Style blocks ignore slash-star block comments only. A slash-slash sequence inside style is code, so
 * url(https://...) stays intact. SQL, shell, YAML, and Markdown are not hashed here.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { NodeTypes, parse as parseTemplate } from "@vue/compiler-dom";
import type {
    DirectiveNode,
    ExpressionNode,
    ForNode,
    IfBranchNode,
    IfNode,
    RootNode,
    TemplateChildNode,
} from "@vue/compiler-dom";
import { parse as parseSfc } from "vue/compiler-sfc";
import type { SFCBlock, SFCDescriptor } from "vue/compiler-sfc";
import type ts from "typescript";

const require = createRequire(import.meta.url);
const typescript = require("typescript") as typeof ts;

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const IGNORED_TRIVIA = new Set<ts.SyntaxKind>([
    typescript.SyntaxKind.SingleLineCommentTrivia,
    typescript.SyntaxKind.MultiLineCommentTrivia,
    typescript.SyntaxKind.NewLineTrivia,
    typescript.SyntaxKind.WhitespaceTrivia,
    typescript.SyntaxKind.ShebangTrivia,
    typescript.SyntaxKind.ConflictMarkerTrivia,
]);

function main(): number {
    const files = process.argv.slice(2);
    if (files.length === 0) {
        process.stderr.write(
            "usage: node .agents/skills/comment-purge/scripts/code-token-hash.ts <file> [<file> ...]\n",
        );
        return 1;
    }

    let exitCode = 0;
    for (const file of files) {
        try {
            const source = readFileSync(file, "utf8");
            const canonical = canonicalTokens(file, source);
            const hash = createHash("sha256").update(canonical).digest("hex");
            process.stdout.write(`${hash}  ${file}\n`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            process.stderr.write(`cannot hash: ${file}: ${message}\n`);
            exitCode = 1;
        }
    }
    return exitCode;
}

function canonicalTokens(file: string, source: string): string {
    const extension = path.extname(file).toLowerCase();
    if (extension === ".vue") return vueTokens(file, source).join("\n");
    if (extension === ".css") {
        return opaqueTokens(source)
            .map((token) => `css:${token}`)
            .join("\n");
    }
    if (CODE_EXTENSIONS.has(extension)) {
        return tsTokenLines(source, variantForName(extension)).join("\n");
    }
    throw new Error(`unsupported extension ${extension || "(none)"}`);
}

function variantForName(name: string): ts.LanguageVariant {
    const normalized = name.toLowerCase();
    if (normalized.endsWith("tsx") || normalized.endsWith("jsx")) {
        return typescript.LanguageVariant.JSX;
    }
    return typescript.LanguageVariant.Standard;
}

function tsTokenLines(source: string, variant: ts.LanguageVariant): string[] {
    const scanner = typescript.createScanner(
        typescript.ScriptTarget.Latest,
        false,
        variant,
        source,
    );
    const lines: string[] = [];
    while (true) {
        const token = scanner.scan();
        if (token === typescript.SyntaxKind.EndOfFileToken) break;
        if (IGNORED_TRIVIA.has(token)) continue;
        lines.push(`${token}:${scanner.getTokenText()}`);
    }
    return lines;
}

interface LocatedBlock {
    offset: number;
    attrs: Record<string, string | true>;
    content: string;
    kind: "script" | "template" | "style" | "custom";
    lang?: string;
}

function vueTokens(file: string, source: string): string[] {
    const parsed = parseSfc(source, { filename: file });
    if (parsed.errors.length > 0) {
        throw new Error(parsed.errors.map((error) => error.message).join("; "));
    }
    const lines: string[] = [];
    for (const block of blocksOf(parsed.descriptor)) {
        lines.push(`block:${block.kind}`);
        for (const [key, value] of Object.entries(block.attrs)) {
            lines.push(value === true ? `block-attr:${key}` : `block-attr:${key}=${value}`);
        }
        if (block.kind === "script") {
            lines.push(...tsTokenLines(block.content, variantForName(block.lang ?? "ts")));
        } else if (block.kind === "template") {
            lines.push(...templateTokens(block));
        } else {
            lines.push(...opaqueTokens(block.content).map((token) => `css:${token}`));
        }
        lines.push(`block-end:${block.kind}`);
    }
    return lines;
}

function blocksOf(descriptor: SFCDescriptor): LocatedBlock[] {
    const blocks: LocatedBlock[] = [];
    const push = (block: SFCBlock | null, kind: LocatedBlock["kind"]) => {
        if (!block) return;
        blocks.push({
            offset: block.loc.start.offset,
            attrs: block.attrs,
            content: block.content,
            kind,
            lang: block.lang,
        });
    };
    push(descriptor.template, "template");
    push(descriptor.script, "script");
    push(descriptor.scriptSetup, "script");
    for (const style of descriptor.styles) push(style, "style");
    for (const custom of descriptor.customBlocks) push(custom, "custom");
    blocks.sort((left, right) => left.offset - right.offset);
    return blocks;
}

function templateTokens(block: LocatedBlock): string[] {
    const lang = block.lang?.toLowerCase();
    if (lang === "pug" || lang === "jade") {
        throw new Error(`cannot token-hash <template lang="${block.lang}">`);
    }
    if (lang && lang !== "html") {
        throw new Error(`cannot token-hash <template lang="${block.lang}">`);
    }
    const errors: string[] = [];
    const ast = parseTemplate(block.content, {
        comments: true,
        whitespace: "preserve",
        onError(error) {
            errors.push(error.message);
        },
    });
    if (errors.length > 0) throw new Error(errors.join("; "));
    const lines: string[] = [];
    walkTemplate(ast, lines);
    return lines;
}

function walkTemplate(node: RootNode | TemplateChildNode, lines: string[]): void {
    switch (node.type) {
        case NodeTypes.ROOT:
            for (const child of node.children) walkTemplate(child, lines);
            return;
        case NodeTypes.ELEMENT:
            lines.push(
                `el:${node.tag}:${node.tagType}:${node.ns}:${node.isSelfClosing ? 1 : 0}`,
            );
            for (const prop of node.props) hashProp(prop, lines);
            for (const child of node.children) walkTemplate(child, lines);
            lines.push(`el-end:${node.tag}`);
            return;
        case NodeTypes.TEXT:
            if (!isAsciiWhitespace(node.content)) lines.push(`text:${node.content}`);
            return;
        case NodeTypes.COMMENT:
            return;
        case NodeTypes.INTERPOLATION:
            lines.push("interp");
            hashExpression(node.content, lines);
            return;
        case NodeTypes.COMPOUND_EXPRESSION:
            hashExpression(node, lines);
            return;
        case NodeTypes.IF:
            walkIf(node, lines);
            return;
        case NodeTypes.IF_BRANCH:
            walkIfBranch(node, lines);
            return;
        case NodeTypes.FOR:
            walkFor(node, lines);
            return;
        default:
            lines.push(`raw:${node.loc.source}`);
    }
}

function walkIf(node: IfNode, lines: string[]): void {
    for (const branch of node.branches) walkIfBranch(branch, lines);
}

function walkIfBranch(node: IfBranchNode, lines: string[]): void {
    if (node.condition) hashExpression(node.condition, lines);
    for (const child of node.children) walkTemplate(child, lines);
}

function walkFor(node: ForNode, lines: string[]): void {
    hashExpression(node.source, lines);
    if (node.valueAlias) hashExpression(node.valueAlias, lines);
    if (node.keyAlias) hashExpression(node.keyAlias, lines);
    if (node.objectIndexAlias) hashExpression(node.objectIndexAlias, lines);
    for (const child of node.children) walkTemplate(child, lines);
}

function hashProp(prop: DirectiveNode | { type: number }, lines: string[]): void {
    if (prop.type !== NodeTypes.DIRECTIVE) {
        const attribute = prop as { name: string; value?: { content: string } };
        lines.push(`attr:${attribute.name}`);
        if (attribute.value) lines.push(`attr-val:${attribute.value.content}`);
        return;
    }
    lines.push(`dir:${prop.rawName ?? prop.name}`);
    if (prop.arg) hashExpression(prop.arg, lines);
    for (const modifier of prop.modifiers) lines.push(`mod:${modifier.content}`);
    if (prop.exp) hashExpression(prop.exp, lines);
}

function hashExpression(exp: ExpressionNode | string | symbol | undefined, lines: string[]): void {
    if (exp === undefined) return;
    if (typeof exp === "string") {
        if (!isAsciiWhitespace(exp)) lines.push(`chunk:${exp}`);
        return;
    }
    if (typeof exp === "symbol") {
        lines.push(`sym:${exp.description ?? ""}`);
        return;
    }
    if (exp.type === NodeTypes.SIMPLE_EXPRESSION) {
        if (exp.isStatic) lines.push(`static:${exp.content}`);
        else lines.push(...tsTokenLines(exp.content, typescript.LanguageVariant.Standard));
        return;
    }
    if (exp.type === NodeTypes.COMPOUND_EXPRESSION) {
        for (const child of exp.children) {
            if (typeof child === "string" || typeof child === "symbol") hashExpression(child, lines);
            else if (child.type === NodeTypes.TEXT) {
                if (!isAsciiWhitespace(child.content)) lines.push(`text:${child.content}`);
            } else hashExpression(child, lines);
        }
        return;
    }
    if (exp.type === NodeTypes.INTERPOLATION) {
        hashExpression(exp.content, lines);
        return;
    }
    lines.push(`expr:${exp.type}:${exp.loc.source}`);
}

function isAsciiWhitespace(value: string): boolean {
    return /^[\t\n\r\f ]*$/.test(value);
}

/** Block comments and HTML comments are dropped. Quoted strings and url() text stay intact. */
function opaqueTokens(source: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let index = 0;

    const flush = () => {
        if (current.length === 0) return;
        tokens.push(current);
        current = "";
    };

    while (index < source.length) {
        const currentChar = source[index] ?? "";
        const nextChar = source[index + 1] ?? "";
        if (currentChar === "/" && nextChar === "*") {
            flush();
            index += 2;
            while (
                index < source.length - 1 &&
                !(source[index] === "*" && source[index + 1] === "/")
            ) {
                index += 1;
            }
            index = index < source.length - 1 ? index + 2 : source.length;
            continue;
        }
        if (currentChar === "<" && source.startsWith("<!--", index)) {
            flush();
            const end = source.indexOf("-->", index + 4);
            index = end === -1 ? source.length : end + 3;
            continue;
        }
        if (currentChar === '"' || currentChar === "'") {
            const quote = currentChar;
            current += currentChar;
            index += 1;
            while (index < source.length) {
                const quoted = source[index] ?? "";
                current += quoted;
                index += 1;
                if (quoted === "\\") {
                    if (index < source.length) {
                        current += source[index] ?? "";
                        index += 1;
                    }
                    continue;
                }
                if (quoted === quote) break;
            }
            continue;
        }
        if (isAsciiWhitespace(currentChar)) {
            flush();
            index += 1;
            continue;
        }
        current += currentChar;
        index += 1;
    }
    flush();
    return tokens;
}

process.exit(main());
