import { useMutation } from "@apollo/client/react";
import { SET_USER_PUSH_NOTIFICATION } from "@/lib/graphql/mutation";
import { UserState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { getDeviceId } from "@/lib/utils";

export function useUserSubscription() {
    const [setUserPushNotification] = useMutation<{
      setUserPushNotification: UserState;
    }>(SET_USER_PUSH_NOTIFICATION);
    const { user, setUser } = useAuth();

    async function subscribeUser(sub: PushSubscription) {
        const deviceId = getDeviceId();
        try {
            const { data } = await setUserPushNotification({
                variables: {
                    input: {
                        pushSubscription: {
                            ...sub,
                            deviceId
                        },
                    },
                },
            });
            if (data?.setUserPushNotification) {
              setUser({ ...user, ...data.setUserPushNotification });
            }
            return { success: true };
        } catch (err) {
            console.error("Failed to update user subscription:", err);
            return { success: false, error: err.message };
        }
    }

    async function unsubscribeUser() {
        const deviceId = getDeviceId();
        try {
            const { data } = await setUserPushNotification({
                variables: {
                    input: {
                        pushSubscription: {
                            endpoint: "",
                            keys: { p256dh: "", auth: "" },
                            deviceId
                        },
                        clearSubscription: true,
                    },
                },
            });
            if (data?.setUserPushNotification) {
                setUser({ ...user, ...data.setUserPushNotification });
            }
            return { success: true };
        } catch (err) {
            console.error("Failed to remove user subscription:", err);
            return { success: false, error: err.message };
        }
    }

    return { subscribeUser, unsubscribeUser };
}
