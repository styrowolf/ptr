rm -rf $(dirname $0)/fern/
fern init --openapi https://fra-1.toplas.xyz/openapi.json
patch $(dirname $0)/fern/fern.config.json $(dirname $0)/fern-org-name.patch
fern generate
