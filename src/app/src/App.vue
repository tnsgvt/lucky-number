<template>
  <div id="app">
    <h1>LUCKY NUMBER GAME</h1>

    <div style="display: flex; justify-content: space-between;margin-top:35px">
      <div class="circle" :class="[prediction[0] ? 'sel' : '']" @click="sel(0)">0</div>
      <div class="circle" :class="[prediction[1] ? 'sel' : '']" @click="sel(1)">1</div>
      <div class="circle" :class="[prediction[2] ? 'sel' : '']" @click="sel(2)">2</div>
      <div class="circle" :class="[prediction[3] ? 'sel' : '']" @click="sel(3)">3</div>
      <div class="circle" :class="[prediction[4] ? 'sel' : '']" @click="sel(4)">4</div>
      <div class="circle" :class="[prediction[5] ? 'sel' : '']" @click="sel(5)">5</div>
      <div class="circle" :class="[prediction[6] ? 'sel' : '']" @click="sel(6)">6</div>
      <div class="circle" :class="[prediction[7] ? 'sel' : '']" @click="sel(7)">7</div>
      <div class="circle" :class="[prediction[8] ? 'sel' : '']" @click="sel(8)">8</div>
      <div class="circle" :class="[prediction[9] ? 'sel' : '']" @click="sel(9)">9</div>
    </div>
    <div v-if="isLoading" class="lds-dual-ring"></div>
    <h2 v-if="msg" class="err">{{msg}}</h2>
    <br><br>
    <div v-if="!gameId">
      Bet Money: <input ref="betAmount" v-model.number="betAmount" size="10">
      <button @click="startGame">START</button>
    </div>
    <div v-else>
      <h3>Game ID: {{gameId}}</h3>
    </div>
  </div>
</template>

<script>
import * as nearAPI from 'near-api-js';
import getConfig from './nearConfig';

let near, walletConnection, contract;
let nearConfig = getConfig(process.env.NODE_ENV || "development");

const MSG_CODE = {
  0: 'Please click [Start] button',
  1: 'Oop ! You LOOSE',
  2: 'This number is chosen, please choose another',
  3: 'Greater than the Lucky Number. Try again',
  4: 'Lower than the Lucky Number. Try again',

  9: 'CONGRATULATION !! YOU WON'
};

export default {
  name: 'App',

  data() {
    return {
      gameId: null,
      betAmount: 0,
      prediction: {},
      msg: null,
      transactionHashes: null,
      isLoading: false,
    }
  },

  async mounted() {
    await this.nearConnect();

    this.transactionHashes = new URL(window.location.href).searchParams.get('transactionHashes');
    if (this.transactionHashes) { // already deposit
      await this.loadGame();
    }
  },

  methods: {
    async nearConnect() {
      // Initializing connection to the NEAR node.
      near = await nearAPI.connect(Object.assign(nearConfig, { deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() }}));

      // Needed to access wallet login
      walletConnection = new nearAPI.WalletConnection(near);

      // Initializing our contract APIs by contract name and configuration.
      contract = await near.loadContract(nearConfig.contractName, {
        // viewMethods: [],
        changeMethods: ['start', 'predict'],
        sender: walletConnection.getAccountId()
      });
    },

    async loadGame() {
      this.isLoading = true;
      try {
        this.gameId = await contract.start();
      } catch(err) {
        this.msg = err;
      } finally {
        this.isLoading = false
      }
    },

    async startGame() {
      this.msg = null;

      if (this.betAmount <= 0) {
        this.msg = 'Please input bet money';
        this.$refs.betAmount.focus();
        return;
      }

      if (!walletConnection.getAccountId()) {
        return this.login();
      }

      const account = await walletConnection.account();
      const balance = (await account.state()).amount;

      if (this.betAmount > balance) {
        this.msg = 'Balance is not enough';
        return;
      }

      await account.sendMoney(
        nearConfig.contractName, // receiver account
        this.betAmount // amount in yoctoNEAR
      );
    },

    sel(num) {
      if (!this.isLoading) {
        return Promise.resolve(this.predict(num));
      }
    },

    async predict(num) {
      this.msg = null;

      let result;

      if (this.gameId == null) {
        result = 0;
      } else if (Object.keys(this.prediction).length >= 3) {
        result = 1;
        this.resetGame();
      } else if (this.prediction[num]) {
        result = 2;
      } else {
        this.isLoading = true;

        try {
          result = await contract.predict({ gameId: this.gameId, num: num });

          if (result == 3 || result == 4) {
            this.$set(this.prediction, num, true);
          } else if (result == 2) {
            return; // do nothing
          } else if (result == 1 || result == 9) {
            // this.resetGame();
          }
        } catch(err) {
          this.msg = err;
        } finally {
          this.isLoading = false;
        }
      }

      this.msg = MSG_CODE[result];
    },

    resetGame() {
      // window.location.href = '/';
      this.gameId = null;
      this.transactionHashes = null;
      // this.msg = null;
      this.betAmount = 0;
    },

    login() {
      walletConnection.requestSignIn(nearConfig.contractName, 'Number Predictaion');
    },

    signOut() {
      walletConnection.signOut();
    },

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.circle {
  height: 80px;
  width: 80px;
  background-color: #555;
  color: white;
  border-radius: 50%;
  cursor: pointer;
}

.circle.sel {
  background-color: blue;
}

.err {
  color: red;
}

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid gray;
  border-color: gray transparent gray transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
