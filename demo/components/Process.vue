<template>
  <div class="process">
    <div>
      <div>ID</div>
      <div>{{ id }}</div>
    </div>
    <div>
      <div>Status</div>
      <div>
        {{ currentStatus }}
        <div :class="['indicator', statusIndicator]"></div>
        {{ timeSinceCreation }}s
      </div>
    </div>
    <div>
      <div>Created At</div>
      <div>{{ createdAtDate }}</div>
    </div>
  </div>
</template>

<script>
import {
  apolloClient,
  initiatePaymentMutation,
  paymentProcessedSubscription,
} from "../apollo.js";

export default {
  data() {
    return {
      timeSinceCreation: parseInt((Date.now() - this.createdAt) / 1000),
      currentStatus: this.status,
      observation: null,
    };
  },
  props: {
    id: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    status: {
      type: String,
      default: "INITIATED",
    },
  },
  watch: {
    timeSinceCreation: {
      handler() {
        if (this.currentStatus === "INITIATED") {
          setTimeout(() => {
            this.timeSinceCreation++;
          }, 1000);
        }
      },
      immediate: true,
    },
    currentStatus: {
      handler() {
        if (this.observation) this.observation.unsubscribe();
      },
    },
  },
  computed: {
    createdAtDate() {
      return this.createdAt.toUTCString();
    },
    statusIndicator() {
      const indicator = {
        INITIATED: "processing",
        SUCCEEDED: "success",
        FAILED: "fail",
      };

      return indicator[this.currentStatus];
    },
  },
  created() {
    apolloClient.mutate({
      mutation: initiatePaymentMutation,
      variables: { id: this.id },
    });

    const subscription = apolloClient.subscribe({
      query: paymentProcessedSubscription,
      variables: { id: this.id },
    });

    this.observation = subscription.subscribe((result) => {
      const {
        data: { paymentProcessed },
      } = result;
      console.log(result);
      this.currentStatus = paymentProcessed.status;
    });
  },
};
</script>

<style scoped>
.process {
  margin: 30px 0px;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: grey;
}

.indicator.processing {
  background: rgb(255, 149, 62);
}

.indicator.success {
  background: rgb(5, 128, 70);
}

.indicator.fail {
  background: rgb(226, 41, 41);
}
</style>
