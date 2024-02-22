/**
 * Cloudflare Worker to Generate Random Fragment Subscription
 * Author: SeRaMo ( https://github.com/seramo/ )
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

// Utility functions
const selectRandomItem = (items) => items[Math.floor(Math.random() * items.length)];
const randomizeCase = (str) => str.split('').map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()).join('');

async function handleRequest(request) {
    // Constants
    const portsList = [443, 8443, 2053, 2096, 2087, 2083];
    const domain = ''; // Replace with your domain.
    const userUUID = ''; // Replace with your User UUID.
    const address = 'www.zula.ir';

    // Randomized constants
    const randomPort = selectRandomItem(portsList);
    const randomizedDomain = randomizeCase(domain);
    const randomizeAddress = randomizeCase(address);
    const randomPath = '/';

    // Configuration object
    const config = {
        "log": {
            "access": "",
            "error": "",
            "loglevel": "warning"
        },
        "inbounds": [
            {
                "tag": "socks",
                "port": 10808,
                "listen": "127.0.0.1",
                "protocol": "socks",
                "sniffing": {
                    "enabled": true,
                    "destOverride": [
                        "http",
                        "tls"
                    ],
                    "routeOnly": false
                },
                "settings": {
                    "auth": "noauth",
                    "udp": true,
                    "allowTransparent": false
                }
            },
            {
                "tag": "http",
                "port": 10809,
                "listen": "127.0.0.1",
                "protocol": "http",
                "sniffing": {
                    "enabled": true,
                    "destOverride": [
                        "http",
                        "tls"
                    ],
                    "routeOnly": false
                },
                "settings": {
                    "auth": "noauth",
                    "udp": true,
                    "allowTransparent": false
                }
            }
        ],
        "outbounds": [
            {
                "tag": "proxy",
                "protocol": "vless",
                "settings": {
                    "vnext": [
                        {
                            "address": randomizeAddress,
                            "port": randomPort,
                            "users": [
                                {
                                    "id": userUUID,
                                    "alterId": 0,
                                    "email": "t@t.tt",
                                    "security": "auto",
                                    "encryption": "none",
                                    "flow": ""
                                }
                            ]
                        }
                    ]
                },
                "streamSettings": {
                    "network": "ws",
                    "security": "tls",
                    "tlsSettings": {
                        "allowInsecure": false,
                        "serverName": randomizedDomain,
                        "alpn": [
                            "h2",
                            "http/1.1"
                        ],
                        "fingerprint": "chrome",
                        "show": false
                    },
                    "wsSettings": {
                        "path": randomPath,
                        "headers": {
                            "Host": randomizedDomain
                        }
                    },
                    "sockopt": {
                        "dialerProxy": "fragment",
                        "tcpKeepAliveIdle": 100,
                        "mark": 255,
                        "tcpNoDelay": true
                    }
                },
                "mux": {
                    "enabled": false,
                    "concurrency": -1
                }
            },
            {
                "tag": "fragment",
                "protocol": "freedom",
                "settings": {
                    "domainStrategy": "AsIs",
                    "fragment": {
                        "packets": "tlshello",
                        "length": "10-20",
                        "interval": "10-20"
                    }
                },
                "streamSettings": {
                    "sockopt": {
                        "tcpNoDelay": true,
                        "tcpKeepAliveIdle": 100
                    }
                }
            },
            {
                "tag": "direct",
                "protocol": "freedom",
                "settings": {}
            },
            {
                "tag": "block",
                "protocol": "blackhole",
                "settings": {
                    "response": {
                        "type": "http"
                    }
                }
            }
        ],
        "routing": {
            "domainStrategy": "AsIs",
            "rules": [
                {
                    "type": "field",
                    "inboundTag": [
                        "api"
                    ],
                    "outboundTag": "api",
                    "enabled": true
                },
                {
                    "id": "5627785659655799759",
                    "type": "field",
                    "port": "0-65535",
                    "outboundTag": "proxy",
                    "enabled": true
                }
            ]
        }
    };

    // Respond with the JSON configuration
    return new Response(JSON.stringify(config), {
        headers: { 'content-type': 'application/json' }
    });
}