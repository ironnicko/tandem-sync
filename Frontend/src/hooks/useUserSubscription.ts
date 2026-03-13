import { useMutation } from "@apollo/client/react";
import { SET_USER_PUSH_NOTIFICATION } from "@/lib/graphql/mutation";
import { UserState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";

export function useUserSubscription() {
  const [updateUser] = useMutation<{ updateUser: UserState }>(SET_USER_PUSH_NOTIFICATION);
  const { user, setUser } = useAuth();

  async function subscribeUser(sub: PushSubscription) {
    try {
      const { data } = await updateUser({
        variables: {
          input: {
            pushSubscription: sub,
          },
        },
      });
      if (data?.updateUser) {
        setUser({ ...user, ...data.updateUser });
      }
      return { success: true };
    } catch (err) {
      console.error("Failed to update user subscription:", err);
      return { success: false, error: err.message };
    }
  }

  async function unsubscribeUser() {
    try {
      const { data } = await updateUser({
        variables: {
          input: {
            clearSubscription: true,
          },
        },
      });
      if (data?.updateUser) {
        setUser({ ...user, ...data.updateUser });
      }
      return { success: true };
    } catch (err) {
      console.error("Failed to remove user subscription:", err);
      return { success: false, error: err.message };
    }
  }

  return { subscribeUser, unsubscribeUser };
}
