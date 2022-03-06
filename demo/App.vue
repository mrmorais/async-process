<template>
  <div>
    <h2>Async Processing Demo</h2>
    <strong>Click the button bellow for start a new process</strong>
    <p>
      - The process takes a random time for completion (upto 10s) and random
      state (SUCCEEDED / FAILED)
    </p>

    <button id="create-new-btn" @click.native="createProcess">
      Create new
    </button>
    <div>
      <Process
        :key="process.data.id"
        v-for="process of processes"
        :id="process.data.id"
        :created-at="process.createdAt"
      />
    </div>
  </div>
</template>

<script>
import Process from "./components/Process";
import { apolloClient, createPaymentMutation } from "./apollo.js";

export default {
  name: "App",
  components: { Process },
  data() {
    return {
      processes: [],
    };
  },
  methods: {
    createProcess() {
      apolloClient
        .mutate({
          mutation: createPaymentMutation,
        })
        .then((data) => {
          const {
            data: { createPayment },
          } = data;

          this.processes.push({
            data: createPayment,
            createdAt: new Date(),
          });
        });
    },
  },
};
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

#create-new-btn {
  box-shadow: inset 0px 1px 0px 0px #f7c5c0;
  background: linear-gradient(to bottom, #fc8d83 5%, #e4685d 100%);
  background-color: #fc8d83;
  border-radius: 6px;
  border: 1px solid #d83526;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 15px;
  font-weight: bold;
  padding: 6px 24px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #b23e35;
}
#create-new-btn:hover {
  background: linear-gradient(to bottom, #e4685d 5%, #fc8d83 100%);
  background-color: #e4685d;
}
#create-new-btn:active {
  position: relative;
  top: 1px;
}
</style>
