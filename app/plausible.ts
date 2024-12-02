import { useGlobalSearchParams, useNavigation, usePathname, useRootNavigationState, useRouter } from "expo-router";
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Dimensions, useWindowDimensions } from "react-native";

interface Event {
    userAgent: string,
    referrer?: string,
    domain: string,
    name: "pageview" | string,
    url: string,
    props: EventProps,
    deviceWidth: number,
}

interface EventProps {
    [propName: string]: string | number | boolean
}

function sendEvent(e: Event, apiHost: string) {
    const body = JSON.stringify({
        d: e.domain,
        n: e.name,
        u: e.url,
        r: e.referrer,
        p: e.props,
        w: e.deviceWidth,
    });
    fetch(`${apiHost}/api/event`, {
        method: "POST",
        headers: {
            "User-Agent": e.userAgent,
            "Content-Type": "application/json",
        },
        body,
    }).then((res) => {}).catch((err) => {})
}

interface PlausibleInitOptions {
    domain: string
    apiHost: string;
}

function getUserAgent() {
    const device = Device.modelName;
    const os = Device.osName;
    const osVersion = Device.osVersion;
    const appName = Application.applicationName;
    const appVersion = Application.nativeApplicationVersion;
    const appBuild = Application.nativeBuildVersion;
    const ua = `${appName}/${appVersion} (${appBuild}) (${device}; ${os} ${osVersion} ${Device.supportedCpuArchitectures})`;
    console.log(ua)
    return ua;
}

export function Plausible(options: PlausibleInitOptions) {
    const isSimulator = false//!Device.isDevice;
    const userAgent = getUserAgent();
    const width = Dimensions.get("window").width;

    function trackPageview(pathname: string, referrer?: string, props: EventProps = {}) {
        const e: Event = {
            userAgent: userAgent,
            domain: options.domain,
            name: "pageview",
            url: pathname,
            referrer: referrer,
            deviceWidth: width,
            props: props,
        }
        console.log(e)
        if (!isSimulator) {
            sendEvent(e, options.apiHost);
        }
    }

    function trackEvent(eventName: string, pathname: string, props: EventProps = {}) {
        const e: Event = {
            userAgent: userAgent,
            domain: options.domain,
            name: eventName,
            url: pathname,
            deviceWidth: width,
            props: props,
        }
        if (!isSimulator) {
            sendEvent(e, options.apiHost);
        }
    }

    return { trackPageview, trackEvent }
}

const plausible = Plausible({
    domain: "ptr.com",
    apiHost: "https://pl.fra-1.toplas.xyz",
});

export default plausible;