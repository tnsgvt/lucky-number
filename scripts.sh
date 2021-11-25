yarn build:release
near dev-deploy ./build/release/src.wasm
near delete $CONTRACT
rm -rf ./neardev
yarn clean
