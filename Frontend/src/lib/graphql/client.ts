import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client";
import api from "../axios";

  const axiosLink = new ApolloLink((operation) => {
    return new Observable((observer) => {
      api.post("/graphql", {
        query: operation.query.loc?.source.body,
        variables: operation.variables,
      })
        .then((result) => {

          observer.next(result.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  });

export const gqlClient = new ApolloClient({ link: axiosLink, cache: new InMemoryCache() });
