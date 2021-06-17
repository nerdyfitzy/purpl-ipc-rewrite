const fs = require('fs');
const request = require('request')
const got = require('got')
const tunnel = require('tunnel')


let chunks = [];
let completed = 0;
let chunksCompleted = 0;
const times = {};

const breakProxies = () => {
    const fullChunks = Math.floor(proxies.length / limit);
    const lastChunk = proxies.length % limit;

    for (let i = 0; i < fullChunks; i += 1) {
      chunks.push(proxies.slice(i * limit, i * limit + limit));
    }

    chunks.push(proxies.slice(fullChunks * limit, fullChunks * limit + lastChunk));
};

const test = async (ip, site) => {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
    };

    const start = new Date().getTime()
    if(ip.indexOf(':') !== ip.lastIndexOf(':')) {
        var response = await got.get('https://www.footlocker.com/', {
            agent: {
                https: tunnel.httpOverHttp({
                    proxy: {
                        host: ip.split(':')[0],
                        port: ip.split(':')[1],
                        proxyAuth: ip.split(':')[2] + ':' + ip.split(':')[3]
                    }
                })
            },
            headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US',
                'Accept-Encoding': 'br, gzip, deflate',
                Connection: 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15'
            }
        })
        var end = new Date().getTime()
    }else {
        var response = await got.get(site, {
            agent: {
                https: tunnel.httpOverHttp({
                    proxy: {
                        host: ip.split(':')[0],
                        port: ip.split(':')[1],
                    }
                }),
                
            },
            headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US',
                'Accept-Encoding': 'br, gzip, deflate',
                Connection: 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15'
            }
        })
        var end = new Date().getTime()
    }
    
    console.log(response, end - start)
}

test('207.228.3.250:2105:butr3251:yieNoo1u', 'https://www.yeezysupply.com/');
