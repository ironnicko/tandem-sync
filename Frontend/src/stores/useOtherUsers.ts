import { create } from "zustand";
import { GeoLocation, OtherUsersStore, UserState } from "./types";
import { GET_USERS_BY_IDS } from "@/lib/graphql/query";
import { gqlClient } from "@/lib/graphql/client";

export const useOtherUsers = create<OtherUsersStore>((set, get) => ({
  users: {},

  addUser: (user) =>
    set((state) => ({
      users: { ...state.users, [user.id as string]: user },
    })),

  addUsers: (users) =>
    set((state) => {
      const newUsers = { ...state.users };
      users.forEach((u) => {
        if (u.id) newUsers[u.id] = u;
      });
      return { users: newUsers };
    }),

  getUserById: (id) => get().users[id],

  setUserLocation: (userId, location) =>
    set((state) => {
      const existingUser = state.users[userId];
      if (!existingUser) return state;

      return {
        users: {
          ...state.users,
          [userId]: { ...existingUser, location },
        },
      };
    }),

  setUsersLocation: (userLocations: Record<string, GeoLocation>) => {
    const userIds = Object.keys(userLocations);
    get().fetchUsersByIds(userIds);
    set((state) => {
      const updatedUsers = { ...state.users } as Record<string, UserState>;

      for (const [userId, location] of Object.entries(userLocations)) {
        const existingUser = updatedUsers[userId];
        console.log(location);

        if (
          !existingUser ||
          existingUser.location?.lat !== location.lat ||
          existingUser.location?.lng !== location.lng
        ) {
          updatedUsers[userId] = {
            ...existingUser,
            name: existingUser?.name ?? "Unknown",
            location: location,
          };
        }
      }

      for (const userId of Object.keys(updatedUsers)) {
        if (!(userId in userLocations)) {
          const existingUser = updatedUsers[userId];
          if (existingUser?.location !== null) {
            updatedUsers[userId] = {
              ...existingUser,
              location: null,
            };
          }
        }
      }

      return { users: updatedUsers };
    });
  },

  fetchUsersByIds: async (ids) => {
    const uniqueIds = ids.filter(
      (id, i) =>
        id &&
        ids.indexOf(id) === i &&
        (get().users[id]?.name === "Unknown" || !get().users[id]?.name),
    );

    if (uniqueIds.length === 0) return;

    try {
      const { data } = await gqlClient.query<{ usersByIds: UserState[] }>({
        query: GET_USERS_BY_IDS,
        variables: { ids: uniqueIds },
        fetchPolicy: "network-only",
      });

      if (data?.usersByIds?.length) {
        set((state) => {
          const newUsers = { ...state.users };
          data.usersByIds.forEach((u) => {
            if (u.id) newUsers[u.id] = u;
          });
          return { users: newUsers };
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },

  clearUsersLocations: () =>
    set((state) => {
      const clearedUsers = { ...state.users };
      Object.keys(clearedUsers).forEach((userId) => {
        if (clearedUsers[userId]) {
          clearedUsers[userId] = { ...clearedUsers[userId], location: null };
        }
      });
      return { users: clearedUsers };
    }),

  clearUsers: () => set({ users: {} }),
}));
