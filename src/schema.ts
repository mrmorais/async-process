const { gql } = require("apollo-server");

export const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  enum PaymentStatus {
    CREATED
    INITIADED
    FAILED
    SUCCEEDED
  }

  type PaymentProcess {
    id: String!
    status: PaymentStatus!
    processedAt: String
  }

  type Mutation {
    createPayment: PaymentProcess
    initiatePayment(id: String!): PaymentProcess
  }

  type Query {
    books: [Book]
  }

  type Subscription {
    bookCreated: Book
    paymentProcessed(id: String): PaymentProcess
  }

  type Mutation {
    createBook: Book
  }
`;
