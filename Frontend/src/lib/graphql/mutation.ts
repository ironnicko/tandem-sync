import { gql } from "@apollo/client";

export const CREATE_RIDE = gql`
  mutation CreateRide(
    $maxRiders: Int!
    $visibility: String!
    $startLat: Float!
    $startLng: Float!
    $destinationLat: Float!
    $destinationLng: Float!
    $startName: String!
    $destinationName: String!
    $tripName: String!
  ) {
    createRide(
      maxRiders: $maxRiders
      visibility: $visibility
      startLat: $startLat
      startLng: $startLng
      destinationLat: $destinationLat
      destinationLng: $destinationLng
      tripName: $tripName
      startName: $startName
      destinationName: $destinationName
    ) {
      rideCode
      status
      settings {
        maxRiders
        visibility
      }
      participants {
        userId
        role
        joinedAt
      }
      start {
        lat
        lng
      }
      startName
      destination {
        lat
        lng
      }
      destinationName
      tripName
      createdAt
    }
  }
`;

export const UPDATE_RIDE = gql`
  mutation UpdateRide(
    $rideCode: String!
    $requestType: String
    $maxRiders: Int
    $visibility: String
    $startedAt: String
    $endedAt: String
    $status: String
    $tripName: String
  ) {
    updateRide(
      rideCode: $rideCode
      requestType: $requestType
      maxRiders: $maxRiders
      visibility: $visibility
      startedAt: $startedAt
      endedAt: $endedAt
      tripName: $tripName
      status: $status
    ) {
      rideCode
      status
      startedAt
      endedAt
      settings {
        maxRiders
        visibility
      }
      participants {
        userId
        role
        joinedAt
      }
      start {
        lat
        lng
      }
      startName
      destination {
        lat
        lng
      }
      destinationName
      tripName
      createdAt
      createdBy
    }
  }
`;

export const SEND_SIGNAL = gql`
  mutation SendSignal(
    $rideCode: String!
    $signalType: String!
    $lat: Float
    $lng: Float
  ) {
    sendSignal(
      rideCode: $rideCode
      signalType: $signalType
      lat: $lat
      lng: $lng
    )
  }
`;

export const JOIN_RIDE = gql`
  mutation JoinRide($rideCode: String!, $role: String!) {
    joinRide(rideCode: $rideCode, role: $role) {
      rideCode
      participants {
        userId
      }
    }
  }
`;

export const SET_USER_PUSH_NOTIFICATION = gql`
  mutation SetUserPushNotification($input: UpdateUserInput!) {
    setUserPushNotification(input: $input) {
      pushSubscription {
        endpoint
        keys {
          p256dh
          auth
        }
      }
    }
  }
`;
