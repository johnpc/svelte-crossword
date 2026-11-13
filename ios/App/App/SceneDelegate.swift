import UIKit
import Capacitor

/// UIScene lifecycle entry point. Required since the iOS 27 SDK: UIKit
/// terminates apps on launch that still use the AppDelegate-only lifecycle.
/// The window and root CAPBridgeViewController come from Main.storyboard
/// via UISceneStoryboardFile in Info.plist.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Cold launch via URL / universal link: forward to Capacitor's App API.
        openURLContexts(connectionOptions.urlContexts)
        connectionOptions.userActivities.forEach(forward)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        if let rootViewController = window?.rootViewController as? CAPBridgeViewController {
            rootViewController.webView?.scrollView.scrollsToTop = false
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        openURLContexts(URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forward(userActivity)
    }

    private func openURLContexts(_ contexts: Set<UIOpenURLContext>) {
        for context in contexts {
            var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
            options[.sourceApplication] = context.options.sourceApplication
            options[.annotation] = context.options.annotation
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: options)
        }
    }

    private func forward(_ userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity) { _ in }
    }
}
