import { getApp } from "@react-native-firebase/app";
import {
    getMessaging,
    getToken,
    registerDeviceForRemoteMessages,
    requestPermission,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

export async function registerForFcmToken() {
    const messaging = getMessaging(getApp());
    // console.log("[NotifDebug] registerForFcmToken:start", {
    //     platform: Platform.OS,
    //     platformVersion: Platform.Version,
    // });

    // Android 13+ runtime notification permission
    if (Platform.OS === "android" && Platform.Version >= 33) {
        const permissionResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        // console.log("[NotifDebug] android-post-notification-permission", {
        //     result: permissionResult,
        // });
    }

    // iOS / general permission prompt
    const authStatus = await requestPermission(messaging);
    // console.log("[NotifDebug] requestPermission:status", { authStatus });
    await registerDeviceForRemoteMessages(messaging);
    // console.log("[NotifDebug] registerDeviceForRemoteMessages:done");

    // Real FCM token
    const token = await getToken(messaging);
    console.log("[NotifDebug] getToken:success", {
        hasToken: Boolean(token),
        token,
    });
    return token;
}
