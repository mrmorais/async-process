import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink,
  split,
} from "@apollo/client/core";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export const createPaymentMutation = gql`
  mutation CreatePayment {
    createPayment {
      id
      status
    }
  }
`;

export const initiatePaymentMutation = gql`
  mutation InitiatePayment($id: String!) {
    initiatePayment(id: $id) {
      id
      status
    }
  }
`;

export const paymentProcessedSubscription = gql`
  subscription WatchPaymentProcess($id: String!) {
    paymentProcessed(id: $id) {
      id
      status
      processedAt
    }
  }
`;
