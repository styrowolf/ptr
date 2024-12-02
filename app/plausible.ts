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
        domain: e.domain,
        name: e.name,
        url: e.url,
        referrer: e.referrer,
        props: e.props,
        width: e.deviceWidth,
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

    if (os === "iOS") {
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1"
        // example
        const ua = `${appName}/${appVersion}:${appBuild} (iPhone; iPhone OS ${osVersion} ${Device.supportedCpuArchitectures}) (${device})`;
        return ua;
    } else {
        "Mozilla/5.0 (Linux; Android 15; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.81 Mobile Safari/537.36"
        // example
        const ua = `${appName}/${appVersion}:${appBuild} (Linux; Android ${osVersion} ${Device.supportedCpuArchitectures}) (${device})`;
        return ua;
    }

}

export function Plausible(options: PlausibleInitOptions) {
    const isSimulator =!Device.isDevice;
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

        if (isSimulator) {
            e.domain = "toplas-dev";
        }

        sendEvent(e, options.apiHost);
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

        if (isSimulator) {
            e.domain = "toplas-dev";
        }
        
        sendEvent(e, options.apiHost);
    }

    return { trackPageview, trackEvent }
}

const plausible = Plausible({
    domain: "toplas",
    apiHost: "https://pl.fra-1.toplas.xyz",
});

export default plausible;