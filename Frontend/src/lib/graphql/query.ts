import { gql } from "@apollo/client";

export const MY_RIDES = gql`
  query {
    myRides {
      rideCode
      status
      startedAt
      endedAt
      createdAt
      createdBy
      settings {
        maxRiders
        visibility
      }
      start {
        lat
        lng
      }
      destination {
        lat
        lng
      }
      startName
      destinationName
      tripName
      participants {
        userId
        role
        joinedAt
      }
    }
  }
`;

export const RIDE = gql`
  query Ride($rideCode: String!) {
    ride(rideCode: $rideCode) {
      rideCode
      status
      startedAt
      endedAt
      createdAt
      createdBy
      settings {
        maxRiders
        visibility
      }
      start {
        lat
        lng
      }
      destination {
        lat
        lng
      }
      startName
      destinationName
      tripName
      participants {
        userId
        role
        joinedAt
      }
    }
  }
`;

export const GET_USERS_BY_IDS = gql`
  query GetUsersByIds($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      name
      image
      email
      createdAt
      isActive
    }
  }
`;

export const ME = gql`
  query {
    me {
      id
      name
      email
      emailVerified
      isActive
      currentRide
      image
    }
  }
`;
