export async function onRequest(context) {
    const authHeader = context.request.headers.get('Authorization');

    // Expected credentials (Change these to your desired login & pass)
    const REQUIRED_USER = "patron";
    const REQUIRED_PASS = "sizzlr-march-2026";

    if (!authHeader) {
        return new Response('Access Denied. Active Patron Passkey Required.', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Sizzlr VIP Lounge"',
            },
        });
    }

    const [scheme, encoded] = authHeader.split(' ');

    if (scheme !== 'Basic' || !encoded) {
        return new Response('Invalid Authorization Scheme', { status: 400 });
    }

    // Decode base64 credentials sent by the browser
    const decoded = atob(encoded);
    const [user, pass] = decoded.split(':');

    if (user === REQUIRED_USER && pass === REQUIRED_PASS) {
        return await context.next(); // Credentials match, serve the app
    }

    return new Response('Invalid Passphrase. Grab this month\'s pass on Patreon.', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Sizzlr VIP Lounge"',
        },
    });
}
