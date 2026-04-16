<?php
/**
 * Plugin Name: ARA — Agent-Ready Architecture
 * Plugin URI:  https://ara-standard.org
 * Description: Makes your WordPress site understandable by AI agents. Adds ARA
 *              discovery headers, redirects AI crawlers to the ARA digest, and
 *              injects ARA hints in your page <head>. Install and activate — no
 *              configuration needed.
 * Version:     1.0.0
 * Author:      ARA Standard
 * Author URI:  https://ara-standard.org
 * License:     CC BY 4.0
 *
 * Usage:
 *   Option A — Install as a plugin:
 *     1. Copy this file to wp-content/plugins/ara-standard/ara-standard.php
 *     2. Activate in WordPress Admin → Plugins
 *
 *   Option B — Add to functions.php:
 *     Copy the code below (excluding the plugin header) to your theme's functions.php
 */

if (!defined('ABSPATH')) {
    exit;
}

// ── Known AI agent User-Agent strings ─────────────────────────────────────────
define('ARA_AI_BOTS', [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'anthropic-ai',
    'PerplexityBot',
    'YouBot',
    'Google-Extended',
    'Gemini',
    'Bytespider',
    'FacebookBot',
    'Applebot',
    'cohere-ai',
    'AI2Bot',
]);

/**
 * Checks whether the current request comes from a known AI agent.
 */
function ara_is_ai_agent(): bool {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    foreach (ARA_AI_BOTS as $bot) {
        if (stripos($ua, $bot) !== false) {
            return true;
        }
    }
    return false;
}

/**
 * Step 1 — Add ARA HTTP headers to every response.
 * These allow any agent to discover the ARA manifest without knowing the standard.
 */
add_action('send_headers', function (): void {
    // Bail early for admin pages
    if (is_admin()) {
        return;
    }

    header('Link: </.well-known/ara/manifest.json>; rel="ara-manifest", </.well-known/ara/digest.md>; rel="ara-digest"');
    header('X-ARA-Manifest: /.well-known/ara/manifest.json');
    header('X-ARA-Version: 1.0');

    // Redirect AI agents to the ARA digest (300 tokens vs 50k of HTML)
    if (ara_is_ai_agent()) {
        $digest_url = home_url('/.well-known/ara/digest.md');
        wp_redirect($digest_url, 302);
        exit;
    }
});

/**
 * Step 2 — Inject ARA <link> tags into every page <head>.
 * Visible to any HTML parser, even without HTTP header support.
 */
add_action('wp_head', function (): void {
    $manifest_url = home_url('/.well-known/ara/manifest.json');
    $digest_url   = home_url('/.well-known/ara/digest.md');
    echo "\n<!-- ARA (Agent-Ready Architecture) — https://ara-standard.org -->\n";
    echo "<link rel=\"ara-manifest\" href=\"{$manifest_url}\" type=\"application/json\">\n";
    echo "<meta name=\"ara:manifest\" content=\"{$manifest_url}\">\n";
    echo "<meta name=\"ara:digest\" content=\"{$digest_url}\">\n";
    echo "<meta name=\"ara:version\" content=\"1.0\">\n\n";
}, 1); // Priority 1 — inject as early as possible in <head>

/**
 * Step 3 — Inject ARA reference into JSON-LD structured data.
 * Agents that parse Schema.org data will find the ARA manifest here.
 */
add_action('wp_head', function (): void {
    if (is_admin()) {
        return;
    }

    $manifest_url = home_url('/.well-known/ara/manifest.json');
    $site_name    = get_bloginfo('name');
    $site_url     = home_url('/');

    $json_ld = [
        '@context' => 'https://schema.org',
        '@type'    => 'WebSite',
        'name'     => $site_name,
        'url'      => $site_url,
        'potentialAction' => [
            '@type'          => 'ReadAction',
            'target'         => $manifest_url,
            'additionalType' => 'https://ara-standard.org/schema/manifest/v1',
            'description'    => 'ARA manifest — machine-readable site description for AI agents',
        ],
    ];

    echo '<script type="application/ld+json">' . wp_json_encode($json_ld, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "</script>\n";
}, 2);

/**
 * Step 4 — Serve /.well-known/ara/ files via WordPress rewrites
 * (fallback if your server doesn't serve .well-known directly).
 */
add_action('init', function (): void {
    add_rewrite_rule(
        '^\.well-known/ara/(.+)$',
        'index.php?ara_file=$matches[1]',
        'top'
    );
});

add_filter('query_vars', function (array $vars): array {
    $vars[] = 'ara_file';
    return $vars;
});

add_action('template_redirect', function (): void {
    $ara_file = get_query_var('ara_file');
    if (!$ara_file) {
        return;
    }

    // Sanitize path — only allow files within .well-known/ara/
    $ara_file = ltrim($ara_file, '/');
    $base_path = ABSPATH . '.well-known/ara/';
    $full_path = realpath($base_path . $ara_file);

    // Security: ensure the resolved path is inside the expected directory
    if (!$full_path || strpos($full_path, realpath($base_path)) !== 0) {
        status_header(404);
        exit;
    }

    if (!file_exists($full_path)) {
        status_header(404);
        exit;
    }

    $ext = pathinfo($full_path, PATHINFO_EXTENSION);
    $mime = match($ext) {
        'json' => 'application/json; charset=utf-8',
        'md'   => 'text/markdown; charset=utf-8',
        default => 'text/plain; charset=utf-8',
    };

    status_header(200);
    header("Content-Type: {$mime}");
    header('Cache-Control: public, max-age=3600');
    readfile($full_path);
    exit;
});

/**
 * Step 5 — Add ARA to robots.txt
 */
add_filter('robots_txt', function (string $output): string {
    $manifest_url = home_url('/.well-known/ara/manifest.json');
    $digest_url   = home_url('/.well-known/ara/digest.md');
    $output .= "\n# ARA (Agent-Ready Architecture) — https://ara-standard.org\n";
    $output .= "ARA-Manifest: {$manifest_url}\n";
    $output .= "ARA-Digest: {$digest_url}\n";
    $output .= "ARA-Version: 1.0\n";
    return $output;
}, 10, 1);
