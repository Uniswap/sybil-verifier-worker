import Router from './router'
import { handleVerify } from './handlers/verify'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
}

function handleOptions(request) {
    let headers = request.headers
    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        let respHeaders = {
            ...corsHeaders,
            'Access-Control-Allow-Headers': request.headers.get(
                'Access-Control-Request-Headers'
            ),
        }
        return new Response(null, {
            headers: respHeaders,
        })
    } else {
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, OPTIONS',
            },
        })
    }
}

async function handleRequest(request) {
    const r = new Router()
    r.get('.*/verify', request => handleVerify(request))
    r.get(
        '/',
        () =>
            new Response(null, {
                status: 404,
                statusText: 'No route specified',
            })
    )
    const resp = await r.route(request)
    return resp
}

const PROXY_ENDPOINT = '/api'

addEventListener('fetch', event => {
    const request = event.request
    const url = new URL(request.url)
    if (url.pathname.startsWith(PROXY_ENDPOINT)) {
        if (request.method === 'OPTIONS') {
            // Handle CORS preflight requests
            event.respondWith(handleOptions(request))
        } else if (
            request.method === 'GET' ||
            request.method === 'HEAD' ||
            request.method === 'POST'
        ) {
            // Handle requests to the API server
            event.respondWith(handleRequest(request))
        } else {
            event.respondWith(
                new Response(null, {
                    status: 405,
                    statusText: 'Method Not Allowed',
                })
            )
        }
    } else {
        event.respondWith(
            new Response(null, {
                status: 404,
                statusText: 'Invalid route',
            })
        )
    }
})
