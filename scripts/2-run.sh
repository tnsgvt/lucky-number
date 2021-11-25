export CONTRACT=dev-1637813915014-93229644471253
export OWNER=uernser.testnet

near call $CONTRACT start --amount 0.03 --account_id $OWNER

near call $CONTRACT predict '{"gameId": 2097433441, "num": 5}' --account_id $OWNER
