/**
 * SSH Proxy Backend Function
 * 
 * SECURITY DESIGN:
 * - All SSH execution happens server-side only. No direct shell access from client.
 * - Auth is validated before any SSH connection attempt.
 * - SSRF protection: blocks connections to private/internal IP ranges.
 * - Destructive command blocklist prevents accidental or malicious system damage.
 * - Output is capped at 50KB to prevent memory exhaustion attacks.
 * - Port is validated to be a real TCP port number.
 * - Command length capped at 2048 characters.
 * - Timeout enforced at 15 seconds to prevent hanging connections.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { Client } from 'npm:ssh2@1.15.0';

const MAX_OUTPUT_BYTES = 50 * 1024; // 50KB max output
const MAX_COMMAND_LENGTH = 2048;
const CONNECTION_TIMEOUT_MS = 15000;

/**
 * SSRF Protection: Block connections to private/internal IP ranges
 * Prevents the backend from being used as a proxy to attack internal infrastructure.
 */
function isPrivateOrReservedHost(host) {
  const trimmed = host.trim().toLowerCase();

  // Block localhost variants
  if (trimmed === 'localhost' || trimmed === 'localhost.localdomain') return true;

  // Block internal domain patterns
  if (trimmed.endsWith('.local') || trimmed.endsWith('.internal') || trimmed.endsWith('.localhost')) return true;

  // Block by IP prefix (IPv4 private ranges)
  const ipv4Patterns = [
    /^127\./,           // loopback
    /^10\./,            // Class A private
    /^192\.168\./,      // Class C private
    /^172\.(1[6-9]|2\d|3[01])\./,  // Class B private (172.16-31)
    /^169\.254\./,      // link-local
    /^0\./,             // 0.0.0.0/8 reserved
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // CGNAT
    /^198\.(1[89])\./,  // TEST-NET
    /^203\.0\.113\./,   // TEST-NET-3
    /^::1$/,            // IPv6 loopback
    /^fc00:/i,          // IPv6 unique local
    /^fd[0-9a-f]{2}:/i, // IPv6 unique local (fd)
    /^fe80:/i,          // IPv6 link-local
  ];

  return ipv4Patterns.some(pattern => pattern.test(trimmed));
}

/**
 * Destructive Command Blocklist
 * Block commands that could permanently damage the target system.
 * Note: This is a safety net, not a security boundary — SSH users already
 * have OS-level access. This prevents accidental destruction.
 */
const DESTRUCTIVE_PATTERNS = [
  { pattern: /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+[\/~]/, label: 'recursive root deletion' },
  { pattern: /:\s*\(\s*\)\s*\{/, label: 'fork bomb' },
  { pattern: /\bdd\b.*\bof=\/dev\/(sd|hd|nvme|vd|xvd)/, label: 'disk overwrite' },
  { pattern: /\b(mkfs|mke2fs|mkswap)\b.*\/dev\//, label: 'filesystem format' },
  { pattern: /\bshred\b.*\/dev\//, label: 'device shred' },
  { pattern: /\bwipefs\b/, label: 'filesystem wipe' },
  { pattern: />\s*\/dev\/(sd|hd|nvme|vd|xvd)/, label: 'direct disk write' },
];

function isDestructiveCommand(command) {
  for (const { pattern, label } of DESTRUCTIVE_PATTERNS) {
    if (pattern.test(command)) return label;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    // --- Authentication ---
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { host, port, username, password, command } = body;

    // --- Input validation ---
    if (!host || typeof host !== 'string') {
      return Response.json({ error: 'host is required' }, { status: 400 });
    }
    if (!username || typeof username !== 'string') {
      return Response.json({ error: 'username is required' }, { status: 400 });
    }
    if (!command || typeof command !== 'string') {
      return Response.json({ error: 'command is required' }, { status: 400 });
    }
    if (command.length > MAX_COMMAND_LENGTH) {
      return Response.json({ error: `Command too long (max ${MAX_COMMAND_LENGTH} characters)` }, { status: 400 });
    }

    // --- Port validation ---
    const portNum = parseInt(port) || 22;
    if (portNum < 1 || portNum > 65535) {
      return Response.json({ error: 'Invalid port number (must be 1-65535)' }, { status: 400 });
    }

    // --- SSRF Protection ---
    if (isPrivateOrReservedHost(host)) {
      return Response.json({ error: 'Connections to private/internal network addresses are not permitted.' }, { status: 403 });
    }

    // --- Destructive command check ---
    const destructiveLabel = isDestructiveCommand(command);
    if (destructiveLabel) {
      return Response.json({
        error: `Blocked: Command matches destructive pattern (${destructiveLabel}). This action is not permitted through the web terminal.`
      }, { status: 403 });
    }

    // --- SSH Execution ---
    const result = await new Promise((resolve) => {
      const conn = new Client();
      let settled = false;

      const done = (val) => {
        if (!settled) { settled = true; resolve(val); }
      };

      const timeout = setTimeout(() => {
        conn.end();
        done({ error: 'Connection timed out after 15 seconds.' });
      }, CONNECTION_TIMEOUT_MS);

      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            clearTimeout(timeout);
            conn.end();
            done({ error: err.message });
            return;
          }

          let output = '';
          let truncated = false;

          const appendOutput = (data) => {
            if (truncated) return;
            const chunk = data.toString();
            if ((output.length + chunk.length) > MAX_OUTPUT_BYTES) {
              output += chunk.slice(0, MAX_OUTPUT_BYTES - output.length);
              output += '\n\n[OUTPUT TRUNCATED — exceeded 50KB limit]';
              truncated = true;
            } else {
              output += chunk;
            }
          };

          stream.on('data', appendOutput);
          stream.stderr.on('data', appendOutput);

          stream.on('close', () => {
            clearTimeout(timeout);
            conn.end();
            done({ output });
          });
        });
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        done({ error: `SSH Error: ${err.message}` });
      });

      conn.connect({
        host: host.trim(),
        port: portNum,
        username: username.trim(),
        password,
        readyTimeout: 12000,
        keepaliveInterval: 0,
        // Reject unauthorized host keys in production would be ideal, but
        // we use tryKeyboard:false to prevent interactive auth escalation
        tryKeyboard: false,
      });
    });

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({ output: result.output });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});